#pragma once

#include <string>
#include "GameLoader.h"

class Application {
public:
    Application(const std::string& gameFilePath);
    ~Application();
    
    void Run();
    
private:
    void LoadGame();
    
    std::string m_GameFilePath;
    GameLoader m_GameLoader;
};
