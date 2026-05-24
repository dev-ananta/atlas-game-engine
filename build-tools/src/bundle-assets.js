const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function bundleAssets(assetsDir, outputPath) {
    console.log('Bundling assets from:', assetsDir);
    
    if (!fs.existsSync(assetsDir)) {
        console.error('Assets directory not found:', assetsDir);
        return false;
    }
    
    const bundle = {
        version: '1.0.0',
        assets: {},
        hashes: {}
    };
    
    // Recursively find all asset files
    function walkDir(dir, baseDir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filepath = path.join(dir, file);
            const stat = fs.statSync(filepath);
            
            if (stat.isDirectory()) {
                walkDir(filepath, baseDir);
            } else {
                // Get relative path
                const relativePath = path.relative(baseDir, filepath);
                
                // Read file
                const data = fs.readFileSync(filepath);
                
                // Calculate hash
                const hash = crypto.createHash('sha256').update(data).digest('hex');
                
                // Store as base64
                bundle.assets[relativePath] = data.toString('base64');
                bundle.hashes[relativePath] = hash;
                
                console.log(`  Added: ${relativePath} (${data.length} bytes, hash: ${hash.substring(0, 8)}...)`);
            }
        }
    }
    
    walkDir(assetsDir, assetsDir);
    
    // Write bundle
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));
    
    console.log(`✓ Asset bundle created: ${outputPath}`);
    console.log(`  Total assets: ${Object.keys(bundle.assets).length}`);
    
    return true;
}

// CLI usage
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

module.exports = { bundleAssets };