# Studio User Guide

## Introduction

The GameEngine Studio is a complete 3D development environment for creating games locally. This guide will help you get started with creating your first game.

## Getting Started

### Creating a New Project

1. Launch GameEngine Studio
2. Click **File → New Project**
3. Choose a project directory
4. Enter a project name
5. Click **Create**

The Studio will initialize a new project structure:
```
MyGame/
├── scene.manifest
├── assets/
│   ├── models/
│   ├── textures/
│   └── audio/
└── scripts/
```

## Interface Overview

### Toolbar
Located at the top, provides quick access to:
- **Save**: Save current project
- **Properties**: Show properties panel
- **Script Editor**: Show Lua script editor

### Scene Hierarchy (Left Panel)
- Displays all entities in your scene
- Click to select entities
- Right-click for context menu
- Drag to reorganize (parent-child relationships)

### Viewport (Center)
- 3D visualization of your scene
- **Left Mouse**: Select objects
- **Right Mouse + Drag**: Rotate camera
- **Scroll Wheel**: Zoom in/out
- **Middle Mouse + Drag**: Pan camera

### Properties Panel (Right Panel)
Displays properties of selected entity:
- **Name**: Entity identifier
- **Transform**:
  - Position (X, Y, Z)
  - Rotation (X, Y, Z in degrees)
  - Scale (X, Y, Z)
- **Components**: Mesh, materials, scripts, physics

### Asset Browser (Bottom Left)
- Browse imported assets
- Drag assets into the scene
- Click **+** to import new assets

## Working with Entities

### Adding Objects

1. Click **Add Cube** in the viewport toolbar
2. A new cube appears at origin (0, 0, 0)
3. Select the cube to edit properties

### Transforming Objects

#### Using Properties Panel
1. Select an object
2. Modify Position, Rotation, or Scale values
3. Changes apply in real-time

#### Using Gizmos (Future Feature)
- **W**: Translate mode
- **E**: Rotate mode
- **R**: Scale mode

### Deleting Objects

1. Select an object in Scene Hierarchy
2. Click the **×** button
3. Or press **Delete** key

## Importing Assets

### Supported Formats

**Models:**
- .obj (Wavefront Object)
- .fbx (Autodesk FBX)
- .gltf / .glb (GL Transmission Format)

**Textures:**
- .png, .jpg, .jpeg
- .bmp, .tga

**Audio:**
- .mp3, .wav, .ogg

### Import Process

1. Click **+** in Asset Browser
2. Select files to import
3. Assets are copied to project directory
4. Use assets by dragging to entities

## Scripting with Lua

### Creating a Script

1. Select an entity
2. Switch to **Script Editor** tab
3. Write Lua code:

```lua
-- Example script
function Start()
    -- Called when game starts
    print("Game started!")
end

function Update(deltaTime)
    -- Called every frame
    -- deltaTime is time since last frame in seconds
end

function OnCollision(other)
    -- Called when collision occurs
    print("Collided with: " .. other.name)
end
```

### Attaching Scripts

1. Write script in editor
2. Click **Save Script**
3. Script is attached to selected entity
4. Script runs when game is played in Runtime

### Available API Functions

See [Lua API Reference](lua-api-reference.md) for complete API documentation.

## Version Control with Git

### Initializing Git

1. Go to **Tools → Git → Initialize Repository**
2. Studio creates initial commit

### Committing Changes

1. Make changes to your scene
2. Click **Tools → Git → Commit**
3. Enter commit message
4. Click **Commit**

### Best Practices

- Commit frequently
- Write descriptive commit messages
- Use branches for experimental features
- Push to GitHub for backup and CI/CD

## Building Your Game

### Manual Build

1. Save your project
2. Open terminal in project directory
3. Run build commands:

```bash
cd build-tools
npm install
node src/validate-manifest.js ../scene.manifest
node src/bundle-assets.js ../assets ../build/assets.bundle
node src/compile-lua.js ../scripts ../build/scripts.bundle
node src/package-game.js ../scene.manifest ../build mygame.game
```

### Automated Build (GitHub Actions)

1. Push project to GitHub
2. GitHub Actions automatically builds on commit
3. Download `.game` file from Actions artifacts
4. Or from Releases page (if tagged)

## Tips and Tricks

### Performance
- Keep entity count reasonable (< 1000 for smooth performance)
- Optimize textures (use power-of-2 sizes: 512x512, 1024x1024)
- Use simple collision shapes for physics

### Organization
- Name entities descriptively
- Group related objects using parent-child hierarchy
- Keep scripts modular and reusable

### Testing
- Regularly test in Runtime client
- Test on target platform (Windows/Linux/macOS)
- Profile performance with many entities

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save project |
| Ctrl+Z | Undo (future) |
| Ctrl+Y | Redo (future) |
| Delete | Delete selected entity |
| F | Frame selected entity (future) |
| Ctrl+D | Duplicate entity (future) |

## Troubleshooting

### Studio won't launch
- Check if required dependencies are installed
- Try running from terminal to see error messages

### Assets not importing
- Verify file format is supported
- Check file isn't corrupted
- Ensure file size is reasonable (< 100MB)

### Git operations failing
- Ensure Git is installed on system
- Check project directory permissions
- Verify you're in a Git repository

### Game won't build
- Run validation script first
- Check for missing assets
- Verify manifest structure is correct

## Next Steps

- Read [Lua API Reference](lua-api-reference.md)
- Explore example projects in `examples/`
- Join community discussions
- Check out advanced tutorials

---

For more help, visit our [documentation](https://github.com/yourusername/game-engine/docs) or [open an issue](https://github.com/yourusername/game-engine/issues).