# GameEngine Studio

The Studio is the creative suite for building games with the GameEngine platform.

## Features

- 🎨 **3D Viewport**: Real-time 3D scene editing with Three.js
- 📝 **Lua Script Editor**: Integrated Monaco editor with syntax highlighting
- 📦 **Asset Management**: Import and organize models, textures, and audio
- 🔧 **Properties Panel**: Edit transforms and component properties
- 🌳 **Scene Hierarchy**: Organize entities with parent-child relationships
- 💾 **Git Integration**: Built-in version control with simple-git
- 💻 **Cross-Platform**: Windows, Linux, and macOS support

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
cd studio
npm install
```

### Run Development Mode

```bash
npm run dev
```

This launches the Studio with DevTools open and hot reload enabled.

### Build

Build for all platforms:

```bash
npm run build
```

Build for specific platform:

```bash
npm run build:linux    # Outputs .AppImage
npm run build:win      # Outputs .exe installer
npm run build:mac      # Outputs .dmg
```

### Project Structure

```
studio/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.js       # Application entry point
│   │   ├── menu.js        # Menu bar configuration
│   │   └── git-integration.js  # Git operations
│   ├── renderer/          # React UI
│   │   ├── App.jsx        # Main app component
│   │   ├── components/    # React components
│   │   │   ├── Viewport3D.jsx
│   │   │   ├── SceneHierarchy.jsx
│   │   │   ├── PropertiesPanel.jsx
│   │   │   ├── AssetBrowser.jsx
│   │   │   └── LuaEditor.jsx
│   │   ├── engine/        # 3D engine code
│   │   │   ├── SceneManager.js
│   │   │   ├── EntitySystem.js
│   │   │   └── AssetLoader.js
│   │   ├── serialization/ # Scene saving/loading
│   │   │   ├── ManifestGenerator.js
│   │   │   └── SceneSerializer.js
│   │   └── styles/
│   │       └── main.css
│   └── preload.js         # Electron preload script
├── public/
│   ├── index.html
│   └── icons/             # App icons
├── package.json
└── electron-builder.json
```

## Technology Stack

- **Electron**: Cross-platform desktop framework
- **React**: UI framework
- **Three.js**: 3D rendering library
- **Monaco Editor**: Code editor (VS Code's editor)
- **simple-git**: Git integration
- **electron-builder**: Application packaging

## IPC Communication

The Studio uses Electron IPC for communication between main and renderer processes:

### File Operations

- `save-project`: Save scene.manifest
- `load-project`: Load scene.manifest
- `import-asset`: Copy asset to project

### Git Operations

- `git-init`: Initialize repository
- `git-commit`: Commit changes
- `git-status`: Get repository status

## Extending the Studio

### Adding a New Component

1. Create component in `src/renderer/components/`
2. Import in `App.jsx`
3. Add to layout

### Adding New IPC Handler

1. Add handler in `src/main/index.js`:

```javascript
ipcMain.handle('my-operation', async (event, arg) => {
  // Handle operation
  return result;
});
```

2. Expose in `src/preload.js`:

```javascript
contextBridge.exposeInMainWorld('api', {
  myOperation: (arg) => ipcRenderer.invoke('my-operation', arg)
});
```

3. Use in renderer:

```javascript
const result = await window.api.myOperation(arg);
```

## Debugging

### Enable DevTools

DevTools are automatically opened when running with `--dev` flag:

```bash
npm run dev
```

### View Logs

Main process logs:
```bash
# Windows
%APPDATA%\game-engine-studio\logs\

# macOS
~/Library/Logs/game-engine-studio/

# Linux
~/.config/game-engine-studio/logs/
```

### Common Issues

**Error: Cannot find module**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build fails**
```bash
# Clear build cache
rm -rf dist
npm run build
```

**Three.js rendering issues**
- Check browser console for WebGL errors
- Verify GPU drivers are up to date
- Try disabling hardware acceleration

## Performance Optimization

- Limit entities in viewport (< 1000 for smooth performance)
- Use instancing for repeated objects (future feature)
- Optimize asset file sizes before import
- Enable GPU acceleration in Electron

## Contributing

When contributing to the Studio:

1. Follow React best practices
2. Use functional components with hooks
3. Keep components small and focused
4. Add PropTypes for type checking
5. Write descriptive commit messages

## Testing

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## License

MIT License - see LICENSE file for details