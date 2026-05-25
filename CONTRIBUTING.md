# CONTRIBUTING

Thanks for contributing to Atlas Game Engine.

## Development Setup

### Build Tools

```bash
cd build-tools
npm ci
```

### Studio

```bash
cd studio
npm ci
npm run build:renderer
```

### Runtime

```bash
cd runtime
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
```

## Validation Before PR

From repo root, validate the hello-world packaging path:

```bash
node build-tools/src/validate-manifest.js examples/hello-world/scene.manifest
node build-tools/src/bundle-assets.js examples/hello-world/assets examples/hello-world/build/assets.bundle
node build-tools/src/compile-lua.js examples/hello-world/scripts examples/hello-world/build/scripts.bundle
node build-tools/src/package-game.js examples/hello-world/scene.manifest examples/hello-world/build hello-world.game
```

Then run runtime build:

```bash
cmake -S runtime -B runtime/build -DCMAKE_BUILD_TYPE=Release
cmake --build runtime/build --config Release
```

## Contribution Guidelines

- Keep changes focused and avoid unrelated refactors.
- Preserve compatibility with existing manifests where possible.
- Update docs when file format, packaging, or runtime loading behavior changes.
- Add or extend checks in CI workflows when introducing new build or packaging behavior.
- Prefer explicit error messages and deterministic serialization formats.

## Pull Request Expectations

Include in PR description:

- Scope and intent
- Behavior changes
- Validation commands executed
- Any known gaps or follow-up work
