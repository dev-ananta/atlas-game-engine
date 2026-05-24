# GameEngine Runtime

The Runtime is a standalone client that loads and executes `.game` files created by the Studio.

## Features

- 🎮 **Standalone Player**: No dependencies on the Studio
- 🔄 **Scene Reconstruction**: Loads scenes from compiled `.game` files
- 🎨 **OpenGL Rendering**: Hardware-accelerated 3D graphics
- ⚡ **Physics Simulation**: Bullet Physics integration
- 📜 **Lua Scripting**: Execute game logic with embedded Lua
- 🖱️ **Input Handling**: Keyboard and mouse support
- 🔊 **Audio Playback**: 3D positional audio (planned)
- 🌐 **Cross-Platform**: Windows, Linux, and macOS

## Building

### Prerequisites

**All Platforms:**
- CMake 3.20 or higher
- C++17 compatible compiler

**Windows:**
- Visual Studio 2022 with C++ development tools
- Windows SDK

**Linux:**
```bash
sudo apt-get install build-essential cmake libgl1-mesa-dev \
  libglu1-mesa-dev libx11-dev libxrandr-dev libxi-dev
```

**macOS:**
```bash
brew install cmake
```

### Build Instructions

```bash
cd runtime
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release
```

The executable will be in:
- Linux: `build/bin/runtime-linux`
- Windows: `build/bin/Release/runtime-windows.exe`
- macOS: `build/bin/runtime-macos`

### Build Options

```bash
# Debug build
cmake .. -DCMAKE_BUILD_TYPE=Debug

# Specify compiler
cmake .. -DCMAKE_CXX_COMPILER=g++-11

# Parallel build
cmake --build . --config Release -j 8
```

## Usage

```bash
./runtime-linux path/to/game.game
```

Or drag and drop a `.game` file onto the executable.

### Command Line Options

```bash
# Show version
./runtime-linux --version

# Show help
./runtime-linux --help

# Windowed mode (default)
./runtime-linux game.game

# Fullscreen mode (planned)
./runtime-linux --fullscreen game.game

# Set resolution (planned)
./runtime-linux --width 1920 --height 1080 game.game
```

## Architecture

### Core Components

```
runtime/
├── src/
│   ├── main.cpp                    # Entry point
│   ├── core/
│   │   ├── Application.cpp/h       # Main application loop
│   │   ├── Window.cpp/h            # GLFW window management
│   │   └── GameLoader.cpp/h        # .game file parser
│   ├── scene/
│   │   ├── SceneReconstructor.cpp/h  # Rebuilds scene from manifest
│   │   ├── Entity.cpp/h            # Game object
│   │   └── Transform.cpp/h         # Position, rotation, scale
│   ├── rendering/
│   │   ├── Renderer.cpp/h          # OpenGL renderer
│   │   ├── Mesh.cpp/h              # 3D geometry
│   │   ├── Material.cpp/h          # Shading properties
│   │   ├── Shader.cpp/h            # GLSL shader programs
│   │   └── Camera.cpp/h            # View and projection
│   ├── physics/
│   │   ├── PhysicsWorld.cpp/h      # Bullet physics simulation
│   │   ├── RigidBody.cpp/h         # Dynamic physics
│   │   └── Collider.cpp/h          # Collision shapes
│   ├── scripting/
│   │   ├── LuaEngine.cpp/h         # Lua VM
│   │   ├── LuaBindings.cpp/h       # C++ <-> Lua API
│   │   └── ScriptComponent.cpp/h   # Script attachment
│   ├── assets/
│   │   ├── AssetManager.cpp/h      # Asset loading and caching
│   │   ├── ModelLoader.cpp/h       # Assimp integration
│   │   └── TextureLoader.cpp/h     # STB image loading
│   └── utils/
│       ├── Logger.cpp/h            # Logging system
│       └── FileSystem.cpp/h        # File I/O utilities
```

### Third-Party Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| GLFW | Window and input | 3.3+ |
| GLAD | OpenGL loader | GL 3.3 Core |
| Lua | Scripting engine | 5.4 |
| Bullet Physics | Physics simulation | 3.25 |
| Assimp | Model loading | 5.3 |
| STB Image | Texture loading | Latest |
| nlohmann/json | JSON parsing | 3.11+ |

### Game Loop

```
Initialize()
  └─ Create Window
  └─ Initialize OpenGL
  └─ Load Game File
  └─ Reconstruct Scene
  └─ Initialize Physics
  └─ Initialize Lua

GameLoop()
  └─ Poll Input
  └─ Update Physics (Fixed timestep)
  └─ Update Lua Scripts
  └─ Render Scene
  └─ Swap Buffers
```

## .game File Format

The `.game` file is a JSON-based format (will be binary in production):

```json
{
  "header": {
    "magic": "GAME",
    "version": "1.0.0",
    "checksum": "sha256hash"
  },
  "manifest": { ... },
  "assets": { ... },
  "scripts": { ... }
}
```

### Loading Process

1. **Validate**: Check magic number and version
2. **Parse Manifest**: Extract scene structure
3. **Load Assets**: Decompress and cache
4. **Compile Scripts**: Load Lua code
5. **Reconstruct Scene**: Create entities with components
6. **Initialize**: Call Lua Start() functions

## Lua API

The Runtime exposes a comprehensive Lua API. See [Lua API Reference](../docs/lua-api-reference.md).

Example script:

```lua
function Start()
    self:AddRigidbody(1.0)
    print("Game started!")
end

function Update(deltaTime)
    if Input.GetKey(Input.KEY_SPACE) then
        self:AddForce(0, 10, 0)
    end
end
```

## Performance

### Optimization Tips

- Use object pooling for frequently created/destroyed entities
- Batch similar draw calls
- Minimize state changes in rendering
- Use spatial partitioning (octree) for large scenes
- Profile with built-in tools

### Benchmarks

| Test | FPS (Avg) | Entities |
|------|-----------|----------|
| Empty Scene | 300+ | 0 |
| Simple Scene | 200+ | 100 |
| Complex Scene | 60+ | 1000 |

*Tested on: Intel i7, NVIDIA GTX 1060, 16GB RAM*

## Debugging

### Enable Debug Mode

Build with debug symbols:

```bash
cmake .. -DCMAKE_BUILD_TYPE=Debug
```

### Logging

Set log level in code:

```cpp
Logger::SetLevel(LogLevel::Debug);
```

Logs are written to:
- Console (stdout/stderr)
- File: `runtime.log`

### Common Issues

**OpenGL errors**
```
Error: Failed to initialize GLAD
```
Solution: Update GPU drivers

**Missing .game file**
```
Usage: runtime <path-to-game-file>
```
Solution: Provide valid .game file path

**Lua script errors**
```
[ERROR] Lua error: attempt to call nil value
```
Solution: Check Lua syntax and API usage

## Extending the Runtime

### Adding a New Component Type

1. Create component class in `src/scene/`
2. Register in `SceneReconstructor`
3. Expose to Lua in `LuaBindings`

### Adding Lua API Functions

1. Implement C++ function
2. Register in `LuaBindings.cpp`:

```cpp
void LuaBindings::RegisterFunctions(lua_State* L) {
    lua_register(L, "MyFunction", MyFunction);
}
```

3. Document in `docs/lua-api-reference.md`

## Testing

Run unit tests:

```bash
cd build
ctest
```

Run with valgrind (Linux):

```bash
valgrind --leak-check=full ./runtime-linux game.game
```

## Contributing

When contributing to the Runtime:

1. Follow Google C++ Style Guide
2. Add unit tests for new features
3. Document public APIs
4. Profile performance impact
5. Test on all platforms

## License

MIT License - see LICENSE file for details