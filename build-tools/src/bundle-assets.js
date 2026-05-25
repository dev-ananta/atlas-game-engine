const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { QUALITY_TIERS } = require('./validate-manifest');

function detectTierFromPath(relativePath) {
  const parts = relativePath.split(/[\\/]/).map((p) => p.toLowerCase());
  if (parts.includes('ultra')) return 'Ultra';
  if (parts.includes('high')) return 'High';
  if (parts.includes('medium')) return 'Medium';
  if (parts.includes('low')) return 'Low';
  if (parts.includes('potato')) return 'Potato';
  return 'Medium';
}

function createEmptyBundle() {
  return {
    version: '1.1.0',
    compression: 'gzip',
    tiers: QUALITY_TIERS.reduce((acc, tier) => {
      acc[tier] = { assets: {}, totalBytes: 0 };
      return acc;
    }, {}),
    hashes: {},
  };
}

function bundleAssets(assetsDir, outputPath) {
  console.log('Bundling assets from:', assetsDir);

  const bundle = createEmptyBundle();

  if (!fs.existsSync(assetsDir)) {
    console.warn('Assets directory not found, generating empty asset bundle.');
  } else {
    function walkDir(dir, baseDir) {
      for (const file of fs.readdirSync(dir)) {
        if (file.startsWith('.')) {
          continue;
        }
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath, baseDir);
          continue;
        }

        const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
        const data = fs.readFileSync(filePath);
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        const tier = detectTierFromPath(relativePath);
        const compressed = zlib.gzipSync(data);

        bundle.tiers[tier].assets[relativePath] = {
          encoding: 'base64',
          compression: 'gzip',
          originalSize: data.length,
          compressedSize: compressed.length,
          data: compressed.toString('base64'),
        };
        bundle.tiers[tier].totalBytes += data.length;
        bundle.hashes[relativePath] = hash;

        console.log(`  Added: ${relativePath} [${tier}] (${data.length} bytes)`);
      }
    }

    walkDir(assetsDir, assetsDir);
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));

  const totalAssets = Object.values(bundle.tiers).reduce((sum, tierInfo) => sum + Object.keys(tierInfo.assets).length, 0);
  console.log(`✓ Asset bundle created: ${outputPath}`);
  console.log(`  Total assets: ${totalAssets}`);

  return true;
}

if (require.main === module) {
  const assetsDir = process.argv[2];
  const outputPath = process.argv[3];

  if (!assetsDir || !outputPath) {
    console.error('Usage: node bundle-assets.js <assets-dir> <output-path>');
    process.exit(1);
  }

  const success = bundleAssets(assetsDir, outputPath);
  process.exit(success ? 0 : 1);
}

module.exports = { bundleAssets, detectTierFromPath, createEmptyBundle };
