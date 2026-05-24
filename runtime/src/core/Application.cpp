#include "Application.h"
#include "../utils/Logger.h"
#include <GLFW/glfw3.h>
#include <stdexcept>

Application::Application(const std::string& gameFilePath)
    : m_GameFilePath(gameFilePath)
    , m_Running(false)
    , m_LastFrameTime(0.0f) {
}

Application::~Application() {
    Shutdown();
}

void Application::Initialize() {
    Logger::Info("Initializing GameEngine Runtime...");
    
    // Initialize GLFW
    if (!glfwInit()) {
        throw std::runtime_error("Failed to initialize GLFW");
    }
    
    // Create window
    m_Window = std::make_unique<Window>("GameEngine Runtime", 1280, 720);
    
    // Initialize renderer
    m_Renderer = std::make_unique<Renderer>();
    m_Renderer->Initialize(1280, 720);
    
    // Initialize physics
    m_PhysicsWorld = std::make_unique<PhysicsWorld>();
    
    // Initialize Lua engine
    m_LuaEngine = std::make_unique<LuaEngine>();
    m_LuaEngine->Initialize();
    
    Logger::Info("Runtime initialized successfully");
}

void Application::LoadGame() {
    Logger::Info("Loading game file: " + m_GameFilePath);
    
    // Create game loader
    m_GameLoader = std::make_unique<GameLoader>();
    
    // Load game file
    if (!m_GameLoader->LoadGameFile(m_GameFilePath)) {
        throw std::runtime_error("Failed to load game file");
    }
    
    // Get manifest data
    auto manifest = m_GameLoader->GetManifest();
    
    // Reconstruct scene
    m_SceneReconstructor = std::make_unique<SceneReconstructor>(
        m_Renderer.get(),
        m_PhysicsWorld.get(),
        m_LuaEngine.get()
    );
    
    m_SceneReconstructor->ReconstructScene(manifest);
    
    Logger::Info("Game loaded successfully");
}

void Application::Run() {
    Initialize();
    LoadGame();
    
    m_Running = true;
    m_LastFrameTime = static_cast<float>(glfwGetTime());
    
    // Call Lua Start functions
    m_LuaEngine->CallStartFunctions();
    
    GameLoop();
}

void Application::GameLoop() {
    while (m_Running && !m_Window->ShouldClose()) {
        float currentTime = static_cast<float>(glfwGetTime());
        float deltaTime = currentTime - m_LastFrameTime;
        m_LastFrameTime = currentTime;
        
        // Poll input
        glfwPollEvents();
        
        // Update
        Update(deltaTime);
        
        // Render
        Render();
        
        // Swap buffers
        m_Window->SwapBuffers();
    }
}

void Application::Update(float deltaTime) {
    // Update physics
    m_PhysicsWorld->Update(deltaTime);
    
    // Update Lua scripts
    m_LuaEngine->CallUpdateFunctions(deltaTime);
    
    // Handle input
    if (m_Window->IsKeyPressed(GLFW_KEY_ESCAPE)) {
        m_Running = false;
    }
}

void Application::Render() {
    m_Renderer->Clear();
    m_Renderer->BeginFrame();
    
    // Render scene
    m_SceneReconstructor->Render();
    
    m_Renderer->EndFrame();
}

void Application::Shutdown() {
    Logger::Info("Shutting down...");
    
    m_LuaEngine.reset();
    m_PhysicsWorld.reset();
    m_SceneReconstructor.reset();
    m_Renderer.reset();
    m_GameLoader.reset();
    m_Window.reset();
    
    glfwTerminate();
}