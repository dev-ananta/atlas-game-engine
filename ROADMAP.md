# ROADMAP

## Status Snapshot

The repository now has an MLP foundation for project scaffolding, tier-aware packaging, encrypted distribution modes, and runtime quality-tier selection.

## MLP Readiness Checklist

- [x] Create project structure from Studio
- [x] Import assets into project folders
- [x] Author and save scene manifest
- [x] Build and export `.game` package
- [x] Load `.game` in Atlas Runtime
- [x] Automatic hardware-based quality tier selection
- [~] Run game logic/rendering in runtime (currently minimal loader execution)

## Highest Priority Next Milestones

1. **Runtime Gameplay Core**
   - Entity/component reconstruction from payload manifest.
   - Script VM execution lifecycle (Start/Update).
   - Deterministic frame loop and basic input integration.

2. **2D/3D Rendering Path**
   - Mesh/material/texture runtime asset decode and upload path.
   - Camera and scene rendering for core primitive and imported model support.
   - Tiered texture/model variant loading in render pipeline.

3. **Studio Authoring UX**
   - Scene file browser and multi-scene support.
   - Script file editing persistence to disk.
   - Build/export UI integrated in Studio instead of manual CLI.

4. **Security and Key Management**
   - Runtime decryption for encrypted packages.
   - Developer keypair management UX for closed builds.
   - Signature verification and tamper response policy.

5. **Quality and Reliability**
   - Unit/integration tests for build-tools and runtime parser.
   - Packaging compatibility tests for legacy manifests.
   - Broader CI checks for regression prevention.

## Technical Debt

- Runtime currently uses regex-based JSON extraction; replace with robust parser.
- Documentation under `docs/` still includes forward-looking capabilities not fully implemented.
- Studio viewport is still prototype-level and not yet bound to full runtime scene parity.
