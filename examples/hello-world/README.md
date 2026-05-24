# Hello World Example

This is a minimal example project to demonstrate the basic functionality of the GameEngine.

## What's Included

- **Ground plane**: A flat surface to establish the scene
- **Rotating cube**: A simple cube that rotates continuously using a Lua script
- **Camera**: Positioned to view the scene
- **Light**: Provides illumination

## How to Build

From the repository root:

```bash
cd build-tools
npm install

# Validate the manifest
node src/validate-manifest.js ../examples/hello-world/scene.manifest

# Bundle assets (none in this example)
node src/bundle-assets.js ../examples/hello-world/assets ../examples/hello-world/build/assets.bundle

# Compile scripts
node src/compile-lua.js ../examples/hello-world/scripts ../examples/hello-world/build/scripts.bundle

# Package the game
node src/package-game.js ../examples/hello-world/scene.manifest ../examples/hello-world/build hello-world.game
```

## How to Run

```bash
# Linux
./runtime/build/runtime-linux examples/hello-world/build/hello-world.game

# Windows
./runtime/build/Release/runtime-windows.exe examples/hello-world/build/hello-world.game

# macOS
./runtime/build/runtime-macos examples/hello-world/build/hello-world.game
```

## What You'll See

- A rotating cube floating above a ground plane
- The cube rotates at 45 degrees per second around the Y axis
- Console output: "Hello World! Cube rotation started."

## Learning Points

1. **Scene Structure**: See how entities are organized in `scene.manifest`
2. **Transform Properties**: Position, rotation, and scale of objects
3. **Lua Scripting**: Basic script structure with `Start()` and `Update()` functions
4. **Component System**: How scripts are attached to entities

## Next Steps

Try modifying:
- Change `rotationSpeed` in `rotate.lua`
- Add more cubes at different positions
- Create a script that moves the cube instead of rotating it
- Add physics to make the cube fall onto the ground

Check out the `platformer-demo` example for a more complex project.