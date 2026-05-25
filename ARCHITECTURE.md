# ARCHITECTURE

## High-Level Components

1. **Atlas Studio (`studio/`)**
   - Electron main process handles filesystem, dialogs, and Git IPC.
   - React renderer provides scene hierarchy, viewport, properties panel, and asset browser.
   - Project creation scaffolds a manifest-driven project structure.

2. **Build Tools (`build-tools/`)**
   - `validate-manifest.js`: schema validation + normalization for legacy/new manifests.
   - `bundle-assets.js`: tier-aware asset bundling with gzip compression.
   - `compile-lua.js`: script collection and hashing.
   - `package-game.js`: `.game` assembly, checksum, and distribution encryption modes.

3. **Atlas Runtime (`runtime/`)**
   - Loads `.game` package metadata.
   - Detects hardware profile (CPU cores + memory).
   - Auto-selects quality tier (Ultra/High/Medium/Low/Potato) from quality profile thresholds.
   - Uses selected tier to determine asset load set.

4. **CI/CD (`.github/workflows/`)**
   - Studio build validation.
   - Runtime CMake matrix build (Windows/macOS/Linux).
   - Example package build and artifact upload.
   - Tag-based release generation.

## Data Flow

Studio project -> `scene.manifest` + assets/scripts -> build tools normalize/validate -> tier bundles + script bundle -> package `.game` -> runtime chooses hardware tier -> runtime loads selected profile.

## Security Model

Packaging supports two distribution modes:

- `open`: optional symmetric AES-256-GCM encryption via shared key.
- `closed`: hybrid encryption (AES-256-GCM payload + RSA-OAEP encrypted data key).

This enables community-editable packages and publisher-controlled closed packages using the same container format.

## Quality-Tier Strategy

- Developers organize assets by tier path (`ultra/`, `high/`, `medium/`, `low/`, `potato/`) or default to Medium.
- Build-tools writes assets into tier buckets.
- Runtime auto-selects a tier from device profile and loads only that tier’s assets.

## Current Architecture Constraints

- Runtime currently focuses on package loading and tier selection, not full rendering/physics parity yet.
- Lua execution and scene simulation are staged as next milestones.
