# Atlas Runtime

Atlas Runtime is the desktop player for `.game` packages.

## Current Capabilities

- Validates package header and basic structure
- Loads Atlas and legacy package metadata
- Detects local hardware profile (CPU cores + memory)
- Auto-selects quality tier (Ultra/High/Medium/Low/Potato)
- Reports selected-tier asset/script/entity counts

## Build

```bash
cd runtime
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
```

## Run

```bash
./build/bin/runtime-linux path/to/game.game
```

## Notes

Rendering/simulation subsystems are intentionally staged; this runtime currently validates and prepares package/runtime selection flow for MLP packaging.
