const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateManifest } = require('./validate-manifest');
const { createEmptyBundle } = require('./bundle-assets');

function parseArgs(argv) {
  const positional = [];
  const options = {
    distribution: 'open',
    symmetricKey: '',
    publicKeyPath: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--distribution') {
      options.distribution = argv[++i] || options.distribution;
    } else if (arg === '--symmetric-key') {
      options.symmetricKey = argv[++i] || '';
    } else if (arg === '--public-key') {
      options.publicKeyPath = argv[++i] || '';
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

function encodePayload(distribution, payloadJson, options) {
  if (distribution === 'open' && options.symmetricKey) {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(options.symmetricKey, salt, 32, { N: 16384, r: 8, p: 1 });
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(payloadJson, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      mode: 'symmetric-aes-256-gcm',
      payload: {
        encoding: 'base64',
        data: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        salt: salt.toString('base64'),
      },
      notes: ['Open/public distribution with collaborative symmetric protection.'],
    };
  }

  if (distribution === 'closed') {
    if (!options.publicKeyPath || !fs.existsSync(options.publicKeyPath)) {
      throw new Error('Closed distribution requires --public-key <path-to-rsa-public-key.pem>');
    }

    const publicKey = fs.readFileSync(options.publicKeyPath, 'utf8');
    const dataKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
    const encrypted = Buffer.concat([cipher.update(payloadJson, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const encryptedDataKey = crypto.publicEncrypt(
      {
        key: publicKey,
        oaepHash: 'sha256',
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      dataKey,
    );

    return {
      mode: 'hybrid-rsa-oaep-aes-256-gcm',
      payload: {
        encoding: 'base64',
        data: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        encryptedDataKey: encryptedDataKey.toString('base64'),
      },
      notes: ['Closed distribution: runtime can execute package; repacking requires private key holder.'],
    };
  }

  return {
    mode: 'none',
    payload: {
      encoding: 'base64',
      data: Buffer.from(payloadJson, 'utf8').toString('base64'),
    },
    notes: ['No encryption applied.'],
  };
}

function packageGame(manifestPath, buildDir, outputName, options = {}) {
  console.log('Packaging game...');
  console.log('  Manifest:', manifestPath);
  console.log('  Build dir:', buildDir);

  const validation = validateManifest(manifestPath);
  if (!validation.valid) {
    console.error('Manifest validation failed.');
    return false;
  }

  const normalizedManifest = validation.normalizedManifest;

  const assetBundlePath = path.join(buildDir, 'assets.bundle');
  const scriptBundlePath = path.join(buildDir, 'scripts.bundle');

  const assetBundle = fs.existsSync(assetBundlePath)
    ? JSON.parse(fs.readFileSync(assetBundlePath, 'utf8'))
    : createEmptyBundle();
  const scriptBundle = fs.existsSync(scriptBundlePath)
    ? JSON.parse(fs.readFileSync(scriptBundlePath, 'utf8'))
    : { version: '1.0.0', scripts: {} };

  const payload = {
    manifest: normalizedManifest,
    assets: assetBundle,
    scripts: scriptBundle,
  };

  const distribution = (options.distribution || normalizedManifest.metadata.distribution || 'open').toLowerCase();
  const payloadJson = JSON.stringify(payload);
  const encoded = encodePayload(distribution, payloadJson, options);

  const gamePackage = {
    header: {
      magic: 'ATLAS_GAME',
      version: '1.1.0',
      created: new Date().toISOString(),
      distribution,
      encryption: {
        mode: encoded.mode,
      },
    },
    metadata: normalizedManifest.metadata,
    runtime: normalizedManifest.runtime,
    qualityProfiles: normalizedManifest.qualityProfiles,
    payload: encoded.payload,
    notes: encoded.notes,
  };

  const checksumInput = JSON.stringify(gamePackage);
  gamePackage.header.checksum = crypto.createHash('sha256').update(checksumInput).digest('hex');

  const outputPath = path.join(buildDir, outputName);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(gamePackage, null, 2));

  const fileSize = fs.statSync(outputPath).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

  console.log(`✓ Game package created: ${outputPath}`);
  console.log(`  Size: ${fileSizeMB} MB`);
  console.log(`  Checksum: ${gamePackage.header.checksum.substring(0, 16)}...`);
  console.log(`  Encryption: ${encoded.mode}`);

  return true;
}

if (require.main === module) {
  const { positional, options } = parseArgs(process.argv.slice(2));
  const manifestPath = positional[0];
  const buildDir = positional[1];
  const outputName = positional[2] || 'game.game';

  if (!manifestPath || !buildDir) {
    console.error('Usage: node package-game.js <manifest-path> <build-dir> [output-name] [--distribution open|closed] [--symmetric-key <key>] [--public-key <pem>]');
    process.exit(1);
  }

  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found:', manifestPath);
    process.exit(1);
  }

  fs.mkdirSync(buildDir, { recursive: true });

  const success = packageGame(manifestPath, buildDir, outputName, options);
  process.exit(success ? 0 : 1);
}

module.exports = { packageGame, parseArgs, encodePayload };
