#pragma once

#include <string>
#include <cstddef>

struct HardwareProfile {
    unsigned int cpuCores = 0;
    double memoryGB = 0.0;
};

class GameLoader {
public:
    GameLoader();
    ~GameLoader();

    bool LoadGameFile(const std::string& filepath);
    std::string GetGameName() const { return m_GameName; }
    std::size_t GetEntityCount() const { return m_EntityCount; }
    std::size_t GetAssetCount() const { return m_AssetCount; }
    std::size_t GetScriptCount() const { return m_ScriptCount; }
    std::string GetSelectedQualityTier() const { return m_SelectedQualityTier; }
    HardwareProfile GetHardwareProfile() const { return m_HardwareProfile; }

private:
    bool ValidateFile(const std::string& filepath, const std::string& content);
    bool ParsePackage(const std::string& content);
    HardwareProfile DetectHardwareProfile() const;
    std::string SelectQualityTier(const std::string& content, const HardwareProfile& profile) const;
    std::size_t CountTierAssets(const std::string& content, const std::string& tier) const;

    std::string m_GameName;
    std::size_t m_EntityCount;
    std::size_t m_AssetCount;
    std::size_t m_ScriptCount;
    bool m_Loaded;
    std::string m_SelectedQualityTier;
    HardwareProfile m_HardwareProfile;
};
