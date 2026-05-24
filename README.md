# Game Engine - Local-First Development Suite

A complete offline game development platform with integrated version control, automated build pipeline, and cross-platform runtime.

## 🎯 Overview

This project provides a **local-first** alternative to cloud-based game engines like Roblox, featuring:

- **Studio Environment**: 3D workspace with Lua scripting
- **Automated Pipeline**: GitHub Actions build system
- **Cross-Platform**: Windows, Linux, and macOS support
- **Git Integration**: Built-in version control
- **Standalone Runtime**: Play games offline

## 🚀 Quick Start

### For Game Developers

1. **Download the Studio** from [Releases](https://github.com/yourusername/game-engine/releases)
   - Windows: `studio-windows.exe`
   - macOS: `studio-macos.dmg`
   - Linux: `studio-linux.AppImage`

2. **Create a new project** in the Studio
3. **Build your game** using the 3D editor and Lua scripts
4. **Save & commit** to GitHub
5. **Download the compiled `.game` file** from GitHub Actions

### For Players

1. **Download the Runtime** from [Releases](https://github.com/yourusername/game-engine/releases)
2. **Open a `.game` file** to play

## 📦 Repository Structure

```
game-engine/
├── studio/          # Studio application (Electron)
├── runtime/         # Runtime client (C++)
├── build-tools/     # Build pipeline scripts
├── docs/            # Documentation
├── examples/        # Example projects
└── tests/           # Test suites
```

## 🛠️ Building from Source

### Prerequisites

- **Node.js 18+** (for Studio)
- **CMake 3.20+** (for Runtime)
- **C++ Compiler** (MSVC/GCC/Clang)

### Build Studio

```bash
cd studio
npm install
npm run build        # Current platform
npm run build:linux  # Linux AppImage
npm run build:win    # Windows installer
npm run build:mac    # macOS DMG
```

### Build Runtime

```bash
cd runtime
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release
```

## 📖 Documentation

- [Studio User Guide](docs/studio-guide.md)
- [Lua API Reference](docs/lua-api-reference.md)
- [Build Pipeline Guide](docs/build-pipeline.md)
- [Runtime Guide](docs/runtime-guide.md)
- [File Formats](docs/file-formats.md)

## 🎮 Example Projects

Check out the `examples/` directory:
- `hello-world/` - Basic scene setup
- `platformer-demo/` - Complete platformer game

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Documentation](docs/)
- [Issue Tracker](https://github.com/yourusername/game-engine/issues)
- [Discussions](https://github.com/yourusername/game-engine/discussions)

## ⭐ Features

- ✅ Full offline development workflow
- ✅ Git-based version control
- ✅ Automated CI/CD pipeline
- ✅ Cross-platform support
- ✅ Lua scripting engine
- ✅ Physics simulation
- ✅ 3D rendering
- ✅ Asset management
- ✅ Scene serialization
- ✅ Component system

---

**Made with ❤️ for game developers who value local-first workflows**