#pragma once

#include <string>
#include <memory>
#include "Window.h"
#include "GameLoader.h"
#include "../scene/SceneReconstructor.h"
#include "../rendering/Renderer.h"
#include "../physics/PhysicsWorld.h"
#include "../scripting/LuaEngine.h"

class Application {
public:
    Application(const std::string& gameFilePath);
    ~Application();
    
    void Run();
    
private:
    void Initialize();
    void LoadGame();
    void GameLoop();
    void Update(float deltaTime);
    void Render();
    void Shutdown();
    
    std::string m_GameFilePath;
    std::unique_ptr<Window> m_Window;
    std::unique_ptr<GameLoader> m_GameLoader;
    std::unique_ptr<SceneReconstructor> m_SceneReconstructor;
    std::unique_ptr<Renderer> m_Renderer;
    std::unique_ptr<PhysicsWorld> m_PhysicsWorld;
    std::unique_ptr<LuaEngine> m_LuaEngine;
    
    bool m_Running;
    float m_LastFrameTime;
};