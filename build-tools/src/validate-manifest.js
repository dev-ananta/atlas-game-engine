const fs = require('fs');
const path = require('path');

const QUALITY_TIERS = ['Ultra', 'High', 'Medium', 'Low', 'Potato'];

function isVec3(value) {
  return Array.isArray(value) && value.length === 3 && value.every((n) => Number.isFinite(n));
}

function defaultQualityProfiles() {
  return {
    Ultra: { minCpuCores: 12, minMemoryGB: 16 },
    High: { minCpuCores: 8, minMemoryGB: 12 },
    Medium: { minCpuCores: 6, minMemoryGB: 8 },
    Low: { minCpuCores: 4, minMemoryGB: 4 },
    Potato: { minCpuCores: 2, minMemoryGB: 2 },
  };
}

function normalizeManifest(manifest) {
  if (manifest.metadata && manifest.qualityProfiles) {
    return {
      formatVersion: manifest.formatVersion || '1.1.0',
      metadata: manifest.metadata,
      runtime: manifest.runtime || { entryScene: 'scene.main' },
      qualityProfiles: manifest.qualityProfiles,
      scene: manifest.scene || { entities: [], assetRegistry: { models: [], textures: [], scripts: [], audio: [] } },
    };
  }

  const scene = manifest.scene || {};
  const metadata = scene.metadata || {};
  return {
    formatVersion: '1.1.0',
    metadata: {
      title: metadata.name || 'Untitled Game',
      creator: 'Unknown Creator',
      releaseDate: new Date().toISOString(),
      genre: 'Unknown',
      description: metadata.description || '',
      coverArt: null,
      version: manifest.version || '1.0.0',
      assetQualityTiers: QUALITY_TIERS,
      recommendedHardware: defaultQualityProfiles(),
      distribution: 'open',
    },
    runtime: {
      entryScene: 'scene.main',
    },
    qualityProfiles: defaultQualityProfiles(),
    scene: {
      metadata: {
        name: metadata.name || 'Main Scene',
        created: metadata.created || new Date().toISOString(),
        modified: metadata.modified || new Date().toISOString(),
        description: metadata.description || '',
      },
      entities: Array.isArray(scene.entities) ? scene.entities : [],
      assetRegistry: scene.assetRegistry || { models: [], textures: [], scripts: [], audio: [] },
    },
  };
}

function validateManifest(manifestPath) {
  console.log('Validating manifest:', manifestPath);

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    console.error('Error reading manifest:', error.message);
    return { valid: false, errors: ['Failed to parse manifest JSON'], warnings: [] };
  }

  const normalized = normalizeManifest(manifest);
  const errors = [];
  const warnings = [];

  if (!normalized.metadata?.title) {
    errors.push('Missing metadata.title');
  }

  if (!Array.isArray(normalized.scene?.entities)) {
    errors.push('scene.entities must be an array');
  }

  const entityIds = new Set();
  for (const [index, entity] of normalized.scene.entities.entries()) {
    if (!entity?.id) {
      errors.push(`Entity ${index} missing id`);
      continue;
    }

    if (entityIds.has(entity.id)) {
      errors.push(`Duplicate entity id: ${entity.id}`);
    }
    entityIds.add(entity.id);

    if (!entity.name) {
      errors.push(`Entity ${entity.id} missing name`);
    }

    if (!entity.transform) {
      errors.push(`Entity ${entity.id} missing transform`);
    } else {
      if (!isVec3(entity.transform.position)) {
        errors.push(`Entity ${entity.id} has invalid transform.position (must be vec3 array)`);
      }
      if (!isVec3(entity.transform.rotation)) {
        errors.push(`Entity ${entity.id} has invalid transform.rotation (must be vec3 array)`);
      }
      if (!isVec3(entity.transform.scale)) {
        errors.push(`Entity ${entity.id} has invalid transform.scale (must be vec3 array)`);
      }
    }
  }

  const qualityProfiles = normalized.qualityProfiles || {};
  for (const tier of QUALITY_TIERS) {
    if (!qualityProfiles[tier]) {
      warnings.push(`qualityProfiles missing ${tier}; default profile is recommended`);
    }
  }

  const projectDir = path.dirname(manifestPath);
  const registry = normalized.scene.assetRegistry || {};
  for (const key of ['models', 'textures', 'scripts', 'audio']) {
    const arr = Array.isArray(registry[key]) ? registry[key] : [];
    for (const entry of arr) {
      const relPath = typeof entry === 'string' ? entry : entry?.path;
      if (!relPath) {
        warnings.push(`assetRegistry.${key} contains an invalid entry`);
        continue;
      }
      const fullPath = path.join(projectDir, relPath);
      if (!fs.existsSync(fullPath)) {
        warnings.push(`Referenced asset not found: ${relPath}`);
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`✗ ${e}`));
    warnings.forEach((w) => console.warn(`⚠ ${w}`));
    return { valid: false, errors, warnings, normalizedManifest: normalized };
  }

  warnings.forEach((w) => console.warn(`⚠ ${w}`));
  console.log('✓ Manifest validation successful');
  return { valid: true, errors, warnings, normalizedManifest: normalized };
}

if (require.main === module) {
  const manifestPath = process.argv[2];

  if (!manifestPath) {
    console.error('Usage: node validate-manifest.js <path-to-manifest>');
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest file not found:', manifestPath);
    process.exit(1);
  }

  const result = validateManifest(manifestPath);
  process.exit(result.valid ? 0 : 1);
}

module.exports = { validateManifest, normalizeManifest, QUALITY_TIERS, defaultQualityProfiles };
