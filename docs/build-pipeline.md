# Build Pipeline Guide

This document explains the automated build pipeline using GitHub Actions and how to set it up for your game projects.

## Overview

The build pipeline consists of three main workflows:

1. **Studio Build**: Builds the Studio application for all platforms
2. **Runtime Build**: Builds the Runtime client for all platforms
3. **Game Package Build**: Compiles game projects into `.game` files

## Workflow Architecture

```
Developer Push → GitHub Actions → Build Artifacts
                        ↓
                  ┌─────┴─────┐
                  ↓           ↓
            Studio Build  Runtime Build
                  ↓           ↓
              Executables  Executables
                  └─────┬─────┘
                        ↓
                  Release Page
```

## Setup Instructions

### 1. Fork or Clone Repository

```bash
git clone https://github.com/yourusername/game-engine.git
cd game-engine
```

### 2. Configure GitHub Repository

#### Enable Actions
1. Go to repository **Settings**
2. Navigate to **Actions → General**
3. Enable "Allow all actions and reusable workflows"

#### Set Up Secrets (Optional)
For code signing:

1. Go to **Settings → Secrets and variables → Actions**
2. Add secrets:
   - `WINDOWS_CERTIFICATE` (Windows code signing)
   - `MACOS_CERTIFICATE` (macOS code signing)
   - `APPLE_ID` (macOS notarization)

### 3. First Build

Push to trigger workflows:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

GitHub Actions will automatically start building.

## Workflow Details

### Studio Build Workflow

**File**: `.github/workflows/build-studio.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Changes in `studio/` directory
- Manual trigger via GitHub UI

**Jobs:**
- **Build Matrix**: Runs on Ubuntu, Windows, and macOS
- **Outputs**:
  - Linux: `.AppImage`
  - Windows: `.exe` installer
  - macOS: `.dmg`

**Duration**: ~10-15 minutes per platform

### Runtime Build Workflow

**File**: `.github/workflows/build-runtime.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Changes in `runtime/` directory
- Manual trigger

**Jobs:**
- **Build Matrix**: Runs on Ubuntu, Windows, and macOS
- **Steps**:
  1. Install dependencies
  2. Configure CMake
  3. Build with CMake
  4. Upload artifacts

**Duration**: ~5-10 minutes per platform

### Game Package Build Workflow

**File**: `.github/workflows/build-game-package.yml`

**Triggers:**
- Push to `main` with changes to:
  - `scene.manifest`
  - `assets/`
  - `scripts/`
- Manual trigger

**Jobs:**
- **Validation**: Validate scene.manifest
- **Bundling**: Bundle assets
- **Compilation**: Compile Lua scripts
- **Packaging**: Create `.game` file

**Duration**: ~2-5 minutes

## Creating a Release

### Automatic Release (Recommended)

1. Create and push a tag:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. GitHub Actions will:
   - Build all platforms
   - Create GitHub Release
   - Upload binaries
   - Generate release notes

### Manual Release

1. Go to **Actions** tab
2. Find successful workflow run
3. Download artifacts
4. Create release manually in **Releases**

## Build Artifacts

### Accessing Build Artifacts

1. Go to **Actions** tab
2. Click on workflow run
3. Scroll to **Artifacts** section
4. Download desired artifact

### Artifact Structure

```
studio-windows.zip
├── studio-windows.exe       # Installer
└── checksums.txt

studio-linux.zip
├── studio-linux.AppImage
└── checksums.txt

studio-macos.zip
├── studio-macos.dmg
└── checksums.txt

runtime-windows.zip
├── runtime-windows.exe
└── runtime-windows.pdb      # Debug symbols

game-package.zip
├── game.game
└── metadata.json
```

## Local Build Pipeline

You can run the build pipeline locally for testing.

### Prerequisites

```bash
# Install Node.js dependencies
cd studio && npm install
cd ../build-tools && npm install
```

### Run Pipeline Locally

```bash
# From project root
./scripts/build-local.sh    # Linux/macOS
.\scripts\build-local.bat   # Windows
```

Or manually:

```bash
# Validate
node build-tools/src/validate-manifest.js scene.manifest

# Bundle assets
node build-tools/src/bundle-assets.js assets build/assets.bundle

# Compile scripts
node build-tools/src/compile-lua.js scripts build/scripts.bundle

# Package game
node build-tools/src/package-game.js scene.manifest build game.game
```

## Customizing the Pipeline

### Add Custom Build Step

Edit `.github/workflows/build-game-package.yml`:

```yaml
- name: Custom Processing
  run: |
    node custom-script.js
    echo "Custom step completed"
```

### Change Build Triggers

Modify workflow triggers:

```yaml
on:
  push:
    branches: [main, develop, feature/*]
    paths:
      - 'custom-directory/**'
```

### Add Platform-Specific Steps

```yaml
- name: Linux-specific step
  if: matrix.os == 'ubuntu-latest'
  run: |
    sudo apt-get install custom-package
```

## Optimization Tips

### Cache Dependencies

The workflows already cache:
- npm packages
- CMake build files
- Git LFS objects

To add custom caching:

```yaml
- name: Cache Custom Data
  uses: actions/cache@v3
  with:
    path: ~/.custom-cache
    key: ${{ runner.os }}-custom-${{ hashFiles('**/lockfile') }}
```

### Parallel Jobs

Split long-running tasks:

```yaml
jobs:
  build-assets:
    runs-on: ubuntu-latest
    steps: [...]
  
  build-scripts:
    runs-on: ubuntu-latest
    steps: [...]
  
  package:
    needs: [build-assets, build-scripts]
    runs-on: ubuntu-latest
    steps: [...]
```

## Troubleshooting

### Build Fails on Windows

**Issue**: MSVC compiler not found

**Solution**: Ensure workflow uses `ilammy/msvc-dev-cmd@v1`

### Build Fails on macOS

**Issue**: Code signing errors

**Solution**: Set `SKIP_NOTARIZATION=true` for testing

### Artifact Upload Fails

**Issue**: Artifact too large (>2GB)

**Solution**: Split into multiple artifacts or compress more

### npm Install Fails

**Issue**: Package-lock.json conflicts

**Solution**: Delete and regenerate:
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

## CI/CD Best Practices

### Version Management

Use semantic versioning in tags:
- `v1.0.0` - Major release
- `v1.1.0` - Minor update
- `v1.0.1` - Patch/bugfix

### Branch Strategy

- `main` - Stable releases
- `develop` - Active development
- `feature/*` - Feature branches
- `hotfix/*` - Critical fixes

### Commit Messages

Follow conventional commits:
```
feat: Add new component type
fix: Resolve rendering glitch
docs: Update API reference
ci: Improve build performance
```

### Testing Before Release

1. Build locally first
2. Test on all target platforms
3. Validate with example projects
4. Check artifact sizes
5. Verify checksums

## Advanced: Custom Runners

For faster builds, use self-hosted runners:

1. Set up build machine
2. Install GitHub Actions runner
3. Configure workflow to use custom runner:

```yaml
runs-on: self-hosted
```

## Monitoring Builds

### View Build Status

Add badge to README:

```markdown
![Build Status](https://github.com/user/repo/actions/workflows/build-studio.yml/badge.svg)
```

### Email Notifications

GitHub sends emails on:
- Failed builds (if you committed)
- Successful builds after failure

Configure in **Settings → Notifications**

## Cost Optimization

GitHub Actions is free for public repositories with limits:
- 2,000 minutes/month for private repos
- Unlimited for public repos

Tips to reduce usage:
- Use caching extensively
- Build only on relevant changes
- Disable workflows not in use
- Use branch protection to require tests

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Electron Builder](https://www.electron.build/)
- [CMake Documentation](https://cmake.org/documentation/)

## Support

For build pipeline issues:
1. Check workflow logs in Actions tab
2. Review [Common Issues](#troubleshooting)
3. Open issue on GitHub
4. Join community discussions

---

Last updated: January 25, 2026