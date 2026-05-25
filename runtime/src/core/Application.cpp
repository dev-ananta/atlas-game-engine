#include "Application.h"
#include "../utils/Logger.h"
#include <stdexcept>

Application::Application(const std::string& gameFilePath) : m_GameFilePath(gameFilePath) {}

Application::~Application() = default;

void Application::LoadGame() {
    Logger::Info("Loading game file: " + m_GameFilePath);
    
    if (!m_GameLoader.LoadGameFile(m_GameFilePath)) {
        throw std::runtime_error("Failed to load game file");
    }

    Logger::Info("Game: " + m_GameLoader.GetGameName());
    Logger::Info("Entities: " + std::to_string(m_GameLoader.GetEntityCount()));
    Logger::Info("Selected quality tier: " + m_GameLoader.GetSelectedQualityTier());
    Logger::Info("Assets: " + std::to_string(m_GameLoader.GetAssetCount()));
    Logger::Info("Scripts: " + std::to_string(m_GameLoader.GetScriptCount()));
    Logger::Info("Game loaded successfully");
}

void Application::Run() {
    LoadGame();
}
