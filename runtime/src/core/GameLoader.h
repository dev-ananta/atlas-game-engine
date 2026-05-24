#pragma once

#include <string>
#include <vector>
#include <map>
#include "../utils/json.hpp"

using json = nlohmann::json;

class GameLoader {
public:
    GameLoader();
    ~GameLoader();
    
    bool LoadGameFile(const std::string& filepath);
    json GetManifest() const { return m_Manifest; }
    
    // Asset retrieval
    std::vector<uint8_t> GetAsset(const std::string& assetPath);
    std::string GetScript(const std::string& scriptPath);
    
private:
    bool ValidateFile(const std::string& filepath);
    bool ExtractManifest(const std::vector<uint8_t>& fileData);
    bool ExtractAssets(const std::vector<uint8_t>& fileData);
    bool ExtractScripts(const std::vector<uint8_t>& fileData);
    
    json m_Manifest;
    std::map<std::string, std::vector<uint8_t>> m_Assets;
    std::map<std::string, std::string> m_Scripts;
    bool m_Loaded;
};