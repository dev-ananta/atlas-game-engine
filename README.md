# Atlas Game Engine

Atlas Game Engine is a local-first, cross-platform game engine prototype focused on simple workflows for indie developers.

## Current MLP Scope

This repository now provides an auditable **MLP foundation** for:

- Project creation in Studio (Electron + React)
- Scene manifest authoring and editing
- Asset import into project folders (models, textures, audio, scripts)
- Build pipeline to produce `.game` packages
- Atlas Runtime package loading with hardware-aware quality tier selection
- Release/CI workflows to validate studio/runtime/package pipelines

## Repository Layout

- `studio/` — Atlas Studio desktop editor
- `runtime/` — Atlas Player runtime loader (C++)
- `build-tools/` — packaging and validation scripts for `.game`
- `examples/hello-world/` — reference project and packaging smoke target
- `.github/workflows/` — CI/CD workflows
- `docs/` — user and pipeline documentation

## Quick Start

### 1) Build tools + package example

```bash
cd build-tools
npm ci
node src/validate-manifest.js ../examples/hello-world/scene.manifest
node src/bundle-assets.js ../examples/hello-world/assets ../examples/hello-world/build/assets.bundle
node src/compile-lua.js ../examples/hello-world/scripts ../examples/hello-world/build/scripts.bundle
node src/package-game.js ../examples/hello-world/scene.manifest ../examples/hello-world/build hello-world.game
```

### 2) Build runtime

```bash
cd runtime
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
```

### 3) Run runtime

```bash
./runtime/build/bin/runtime-linux examples/hello-world/build/hello-world.game
```

## Documentation Index

- `ARCHITECTURE.md` — system architecture and responsibilities
- `FILE_FORMAT.md` — `.game` container, manifest and encryption model
- `ROADMAP.md` — priorities to move from MLP foundation to production
- `CONTRIBUTING.md` — contribution and validation workflow
- `docs/studio-guide.md` — editor usage
- `docs/build-pipeline.md` — CI/CD and packaging flow

## Current Limitations

This is still an early MLP foundation. Not all runtime simulation/rendering systems described in legacy docs are implemented yet.

Key known gaps are tracked in `ROADMAP.md`.
