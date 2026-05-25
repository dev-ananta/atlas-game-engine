# Atlas Studio

Atlas Studio is an Electron + React editor for creating Atlas projects.

## Current Capabilities

- Create a new project scaffold with `scene.manifest`
- Open existing project directories
- Edit scene entities in hierarchy/properties panels
- Import assets (models, textures, audio, Lua scripts)
- Save manifest changes

## Development

```bash
cd studio
npm ci
npm run build:renderer
npm run dev
```

## Packaging

```bash
npm run build:linux
npm run build:win
npm run build:mac
```

## Notes

The viewport and scripting UX are currently prototype-level and continue to evolve toward full runtime parity.
