#include "GameLoader.h"
#include "../utils/Logger.h"
#include "../utils/FileSystem.h"
#include <fstream>
#include <sstream>

GameLoader::GameLoader()
    : m_Loaded(false) {
}

GameLoader::~GameLoader() {
}

bool GameLoader::LoadGameFile(const std::string& filepath) {
    Logger::Info("Loading game file: " + filepath);
    
    // Read entire file
    std::vector<uint8_t> fileData = FileSystem::ReadBinaryFile(filepath);
    if (fileData.empty()) {
        Logger::Error("Failed to read game file");
        return false;
    }
    
    // Validate file format
    if (!ValidateFile(filepath)) {
        Logger::Error("Invalid game file format");
        return false;
    }
    
    // Extract sections
    if (!ExtractManifest(fileData)) {
        Logger::Error("Failed to extract manifest");
        return false;
    }
    
    if (!ExtractAssets(fileData)) {
        Logger::Error("Failed to extract assets");
        return false;
    }
    
    if (!ExtractScripts(fileData)) {
        Logger::Error("Failed to extract scripts");
        return false;
    }
    
    m_Loaded = true;
    Logger::Info("Game file loaded successfully");
    return true;
}

bool GameLoader::ValidateFile(const std::string& filepath) {
    // Check file extension
    if (filepath.substr(filepath.find_last_of(".") + 1) != "game") {
        return false;
    }
    
    // In a real implementation, check magic number and version
    return true;
}

bool GameLoader::ExtractManifest(const std::vector<uint8_t>& fileData) {
    try {
        // For now, assume the file is just JSON (simplified)
        // In production, this would parse the binary format
        std::string jsonStr(fileData.begin(), fileData.end());
        m_Manifest = json::parse(jsonStr);
        return true;
    } catch (const std::exception& e) {
        Logger::Error("Manifest parsing error: " + std::string(e.what()));
        return false;
    }
}

bool GameLoader::ExtractAssets(const std::vector<uint8_t>& fileData) {
    // In production, extract from binary bundle
    // For now, placeholder
    return true;
}

bool GameLoader::ExtractScripts(const std::vector<uint8_t>& fileData) {
    // In production, extract from binary bundle
    // For now, placeholder
    return true;
}

std::vector<uint8_t> GameLoader::GetAsset(const std::string& assetPath) {
    if (m_Assets.find(assetPath) != m_Assets.end()) {
        return m_Assets[assetPath];
    }
    return std::vector<uint8_t>();
}

std::string GameLoader::GetScript(const std::string& scriptPath) {
    if (m_Scripts.find(scriptPath) != m_Scripts.end()) {
        return m_Scripts[scriptPath];
    }
    return "";
}