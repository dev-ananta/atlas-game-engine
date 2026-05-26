#include "GameLoader.h"
#include "../utils/Logger.h"
#include "../utils/FileSystem.h"

#include <algorithm>
#include <cctype>
#include <regex>
#include <thread>
#include <vector>

#if defined(_WIN32)
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>
#elif defined(__APPLE__)
#include <sys/sysctl.h>
#else
#include <unistd.h>
#endif

namespace {
std::string Base64Decode(const std::string& input) {
    static const std::vector<int> lookup = []() {
        const std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        std::vector<int> table(256, -1);
        for (std::size_t i = 0; i < chars.size(); ++i) {
            table[static_cast<unsigned char>(chars[i])] = static_cast<int>(i);
        }
        return table;
    }();

    std::string output;
    int val = 0;
    int valb = -8;
    for (unsigned char c : input) {
        if (std::isspace(c)) {
            continue;
        }
        if (c == '=') {
            break;
        }
        if (lookup[c] == -1) {
            return "";
        }
        val = (val << 6) + lookup[c];
        valb += 6;
        if (valb >= 0) {
            output.push_back(static_cast<char>((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return output;
}
} // namespace

GameLoader::GameLoader()
    : m_GameName("Untitled")
    , m_EntityCount(0)
    , m_AssetCount(0)
    , m_ScriptCount(0)
    , m_Loaded(false)
    , m_SelectedQualityTier("Medium") {
}

GameLoader::~GameLoader() = default;

bool GameLoader::LoadGameFile(const std::string& filepath) {
    Logger::Info("Loading game file: " + filepath);

    const std::string content = FileSystem::ReadTextFile(filepath);
    if (content.empty()) {
        Logger::Error("Failed to read game file");
        return false;
    }

    if (!ValidateFile(filepath, content)) {
        Logger::Error("Invalid game file format");
        return false;
    }

    if (!ParsePackage(content)) {
        Logger::Error("Failed to parse game package");
        return false;
    }

    m_Loaded = true;
    Logger::Info("Game file loaded successfully");
    return true;
}

bool GameLoader::ValidateFile(const std::string& filepath, const std::string& content) {
    const std::size_t extensionPos = filepath.find_last_of('.');
    if (extensionPos == std::string::npos || filepath.substr(extensionPos + 1) != "game") {
        return false;
    }

    const bool hasLegacyMagic = content.find("\"magic\"") != std::string::npos && content.find("\"GAME\"") != std::string::npos;
    const bool hasAtlasMagic = content.find("\"magic\"") != std::string::npos && content.find("\"ATLAS_GAME\"") != std::string::npos;
    return hasLegacyMagic || hasAtlasMagic;
}

HardwareProfile GameLoader::DetectHardwareProfile() const {
    HardwareProfile profile;

    profile.cpuCores = std::max(1u, std::thread::hardware_concurrency());

#if defined(_WIN32)
    MEMORYSTATUSEX status;
    status.dwLength = sizeof(status);
    if (GlobalMemoryStatusEx(&status)) {
        profile.memoryGB = static_cast<double>(status.ullTotalPhys) / (1024.0 * 1024.0 * 1024.0);
    }
#elif defined(__APPLE__)
    int64_t memBytes = 0;
    size_t size = sizeof(memBytes);
    if (sysctlbyname("hw.memsize", &memBytes, &size, nullptr, 0) == 0) {
        profile.memoryGB = static_cast<double>(memBytes) / (1024.0 * 1024.0 * 1024.0);
    }
#else
    const long pages = sysconf(_SC_PHYS_PAGES);
    const long pageSize = sysconf(_SC_PAGE_SIZE);
    if (pages > 0 && pageSize > 0) {
        profile.memoryGB = static_cast<double>(pages) * static_cast<double>(pageSize) / (1024.0 * 1024.0 * 1024.0);
    }
#endif

    if (profile.memoryGB <= 0.0) {
        profile.memoryGB = 4.0;
    }

    return profile;
}

std::string GameLoader::SelectQualityTier(const std::string& content, const HardwareProfile& profile) const {
    struct TierRule {
        const char* name;
        int defaultCores;
        int defaultMemory;
    };

    static const TierRule kRules[] = {
        {"Ultra", 12, 16},
        {"High", 8, 12},
        {"Medium", 6, 8},
        {"Low", 4, 4},
        {"Potato", 2, 2},
    };

    for (const auto& rule : kRules) {
        int minCpu = rule.defaultCores;
        int minMem = rule.defaultMemory;

        const std::string pattern =
            "\\\"" + std::string(rule.name) + "\\\"\\s*:\\s*\\{[^}]*\\\"minCpuCores\\\"\\s*:\\s*(\\d+)[^}]*\\\"minMemoryGB\\\"\\s*:\\s*(\\d+)";
        std::regex regexPattern(pattern);
        std::smatch match;
        if (std::regex_search(content, match, regexPattern) && match.size() >= 3) {
            minCpu = std::stoi(match[1].str());
            minMem = std::stoi(match[2].str());
        }

        if (static_cast<int>(profile.cpuCores) >= minCpu && profile.memoryGB >= static_cast<double>(minMem)) {
            return rule.name;
        }
    }

    return "Potato";
}

std::size_t GameLoader::CountTierAssets(const std::string& content, const std::string& tier) const {
    const std::string pattern =
        "\\\"" + tier + "\\\"\\s*:\\s*\\{[\\s\\S]*?\\\"assets\\\"\\s*:\\s*\\{([\\s\\S]*?)\\}\\s*,\\s*\\\"totalBytes\\\"";
    std::regex tierAssetsPattern(pattern);
    std::smatch match;

    if (std::regex_search(content, match, tierAssetsPattern) && match.size() > 1) {
        const std::string block = match[1].str();
        const std::regex assetEntryPattern("\\\"data\\\"\\s*:");
        return std::distance(std::sregex_iterator(block.begin(), block.end(), assetEntryPattern), std::sregex_iterator());
    }

    const std::regex legacyAssetPattern("\\\"assetHashes\\\"\\s*:\\s*\\{([^}]*)\\}");
    if (std::regex_search(content, match, legacyAssetPattern) && match.size() > 1) {
        const std::string block = match[1].str();
        const std::regex keyPattern("\\\"[^\\\"]+\\\"\\s*:");
        return std::distance(std::sregex_iterator(block.begin(), block.end(), keyPattern), std::sregex_iterator());
    }

    return 0;
}

bool GameLoader::ParsePackage(const std::string& content) {
    if (content.find("\"manifest\"") == std::string::npos &&
        content.find("\"metadata\"") == std::string::npos) {
        Logger::Error("Package is missing required metadata/manifest section");
        return false;
    }

    std::smatch match;
    std::string searchableContent = content;

    const std::regex encryptionModePattern("\\\"encryption\\\"\\s*:\\s*\\{[^}]*\\\"mode\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
    std::string encryptionMode = "none";
    if (std::regex_search(content, match, encryptionModePattern) && match.size() > 1) {
        encryptionMode = match[1].str();
    }

    if (encryptionMode == "none") {
        const std::regex payloadDataPattern("\\\"payload\\\"\\s*:\\s*\\{[^}]*\\\"data\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
        if (std::regex_search(content, match, payloadDataPattern) && match.size() > 1) {
            const std::string decoded = Base64Decode(match[1].str());
            if (!decoded.empty()) {
                searchableContent = decoded;
            }
        }
    }

    const std::regex titlePattern("\\\"title\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
    const std::regex legacyNamePattern("\\\"name\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
    if (std::regex_search(searchableContent, match, titlePattern) && match.size() > 1) {
        m_GameName = match[1].str();
    } else if (std::regex_search(searchableContent, match, legacyNamePattern) && match.size() > 1) {
        m_GameName = match[1].str();
    }

    const std::regex entityPattern("\\\"id\\\"\\s*:");
    m_EntityCount = std::distance(std::sregex_iterator(searchableContent.begin(), searchableContent.end(), entityPattern), std::sregex_iterator());

    const std::regex scriptSourcePattern("\\\"source\\\"\\s*:");
    m_ScriptCount = std::distance(std::sregex_iterator(searchableContent.begin(), searchableContent.end(), scriptSourcePattern), std::sregex_iterator());

    m_HardwareProfile = DetectHardwareProfile();
    m_SelectedQualityTier = SelectQualityTier(searchableContent, m_HardwareProfile);
    m_AssetCount = CountTierAssets(searchableContent, m_SelectedQualityTier);

    Logger::Info("Detected hardware: CPU cores=" + std::to_string(m_HardwareProfile.cpuCores) +
                 ", memoryGB=" + std::to_string(static_cast<int>(m_HardwareProfile.memoryGB)));
    Logger::Info("Selected quality tier: " + m_SelectedQualityTier);

    return true;
}
