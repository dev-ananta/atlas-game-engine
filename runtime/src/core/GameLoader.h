#pragma once

#include <string>
#include <cstddef>

class GameLoader {
public:
    GameLoader();
    ~GameLoader();
    
    bool LoadGameFile(const std::string& filepath);
    std::string GetGameName() const { return m_GameName; }
    std::size_t GetEntityCount() const { return m_EntityCount; }
    std::size_t GetAssetCount() const { return m_AssetCount; }
    std::size_t GetScriptCount() const { return m_ScriptCount; }
    
private:
    bool ValidateFile(const std::string& filepath);
    bool ParsePackage(const std::string& content);
    
    std::string m_GameName;
    std::size_t m_EntityCount;
    std::size_t m_AssetCount;
    std::size_t m_ScriptCount;
    bool m_Loaded;
};
