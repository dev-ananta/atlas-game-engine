#include "GameLoader.h"
#include "../utils/Logger.h"
#include "../utils/FileSystem.h"
#include <regex>

GameLoader::GameLoader()
    : m_GameName("Untitled")
    , m_EntityCount(0)
    , m_AssetCount(0)
    , m_ScriptCount(0)
    , m_Loaded(false) {
}

GameLoader::~GameLoader() {
}

bool GameLoader::LoadGameFile(const std::string& filepath) {
    Logger::Info("Loading game file: " + filepath);
    
    std::string content = FileSystem::ReadTextFile(filepath);
    if (content.empty()) {
        Logger::Error("Failed to read game file");
        return false;
    }
    
    // Validate file format
    if (!ValidateFile(filepath)) {
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

bool GameLoader::ValidateFile(const std::string& filepath) {
    const std::size_t extensionPos = filepath.find_last_of('.');
    if (extensionPos == std::string::npos || filepath.substr(extensionPos + 1) != "game") {
        return false;
    }
    
    return true;
}

bool GameLoader::ParsePackage(const std::string& content) {
    if (content.find("\"magic\"") == std::string::npos ||
        content.find("\"GAME\"") == std::string::npos ||
        content.find("\"manifest\"") == std::string::npos) {
        Logger::Error("Package is missing required GAME header or manifest");
        return false;
    }

    std::smatch match;
    const std::regex namePattern("\"name\"\\s*:\\s*\"([^\"]+)\"");
    if (std::regex_search(content, match, namePattern) && match.size() > 1) {
        m_GameName = match[1].str();
    }

    const std::regex entityPattern("\"id\"\\s*:\\s*\"");
    m_EntityCount = std::distance(
        std::sregex_iterator(content.begin(), content.end(), entityPattern),
        std::sregex_iterator()
    );

    const std::regex assetHashPattern("\"assetHashes\"\\s*:\\s*\\{([^}]*)\\}");
    if (std::regex_search(content, match, assetHashPattern) && match.size() > 1) {
        const std::string assetBlock = match[1].str();
        const std::regex keyPattern("\"[^\"]+\"\\s*:");
        m_AssetCount = std::distance(
            std::sregex_iterator(assetBlock.begin(), assetBlock.end(), keyPattern),
            std::sregex_iterator()
        );
    }

    const std::regex scriptsPattern("\"scripts\"\\s*:\\s*\\{([^}]*)\\}");
    if (std::regex_search(content, match, scriptsPattern) && match.size() > 1) {
        const std::string scriptBlock = match[1].str();
        const std::regex keyPattern("\"[^\"]+\"\\s*:");
        m_ScriptCount = std::distance(
            std::sregex_iterator(scriptBlock.begin(), scriptBlock.end(), keyPattern),
            std::sregex_iterator()
        );
    }

    return true;
}
