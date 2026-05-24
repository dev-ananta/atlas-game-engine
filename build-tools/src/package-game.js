const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function packageGame(manifestPath, buildDir, outputName) {
    console.log('Packaging game...');
    console.log('  Manifest:', manifestPath);
    console.log('  Build dir:', buildDir);
    
    // Read manifest
    let manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
        console.error('Error reading manifest:', error.message);
        return false;
    }
    
    // Read asset bundle
    let assetBundle = { assets: {}, hashes: {} };
    const assetBundlePath = path.join(buildDir, 'assets.bundle');
    if (fs.existsSync(assetBundlePath)) {
        assetBundle = JSON.parse(fs.readFileSync(assetBundlePath, 'utf8'));
        console.log(`  Loaded ${Object.keys(assetBundle.assets).length} assets`);
    }
    
    // Read script bundle
    let scriptBundle = { scripts: {} };
    const scriptBundlePath = path.join(buildDir, 'scripts.bundle');
    if (fs.existsSync(scriptBundlePath)) {
        scriptBundle = JSON.parse(fs.readFileSync(scriptBundlePath, 'utf8'));
        console.log(`  Loaded ${Object.keys(scriptBundle.scripts).length} scripts`);
    }
    
    // Create game package
    const gamePackage = {
        header: {
            magic: 'GAME',
            version: '1.0.0',
            created: new Date().toISOString()
        },
        manifest: manifest,
        assets: assetBundle.assets,
        assetHashes: assetBundle.hashes,
        scripts: scriptBundle.scripts
    };
    
    // Calculate checksum
    const packageJson = JSON.stringify(gamePackage);
    const checksum = crypto.createHash('sha256').update(packageJson).digest('hex');
    gamePackage.header.checksum = checksum;
    
    // Write game file
    const outputPath = path.join(buildDir, outputName);
    fs.writeFileSync(outputPath, JSON.stringify(gamePackage, null, 2));
    
    const fileSize = fs.statSync(outputPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    console.log(`✓ Game package created: ${outputPath}`);
    console.log(`  Size: ${fileSizeMB} MB`);
    console.log(`  Checksum: ${checksum.substring(0, 16)}...`);
    
    return true;
}

// CLI usage
if (require.main === module) {
    const manifestPath = process.argv[2];
    const buildDir = process.argv[3];
    const outputName = process.argv[4] || 'game.game';
    
    if (!manifestPath || !buildDir) {
        console.error('Usage: node package-game.js <manifest-path> <build-dir> [output-name]');
        process.exit(1);
    }
    
    if (!fs.existsSync(manifestPath)) {
        console.error('Manifest not found:', manifestPath);
        process.exit(1);
    }
    
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }
    
    const success = packageGame(manifestPath, buildDir, outputName);
    process.exit(success ? 0 : 1);
}

module.exports = { packageGame };