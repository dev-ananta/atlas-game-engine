const fs = require('fs');
const path = require('path');

function compileScripts(scriptsDir, outputPath) {
    console.log('Compiling Lua scripts from:', scriptsDir);
    
    if (!fs.existsSync(scriptsDir)) {
        console.error('Scripts directory not found:', scriptsDir);
        return false;
    }
    
    const bundle = {
        version: '1.0.0',
        scripts: {}
    };
    
    // Recursively find all Lua files
    function walkDir(dir, baseDir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filepath = path.join(dir, file);
            const stat = fs.statSync(filepath);
            
            if (stat.isDirectory()) {
                walkDir(filepath, baseDir);
            } else if (file.endsWith('.lua')) {
                // Get relative path
                const relativePath = path.relative(baseDir, filepath);
                
                // Read script
                const code = fs.readFileSync(filepath, 'utf8');
                
                // In production, you might compile to bytecode here
                // For now, just store the source
                bundle.scripts[relativePath] = code;
                
                console.log(`  Compiled: ${relativePath} (${code.length} bytes)`);
            }
        }
    }
    
    walkDir(scriptsDir, scriptsDir);
    
    // Write bundle
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));
    
    console.log(`✓ Script bundle created: ${outputPath}`);
    console.log(`  Total scripts: ${Object.keys(bundle.scripts).length}`);
    
    return true;
}

// CLI usage
if (require.main === module) {
    const scriptsDir = process.argv[2];
    const outputPath = process.argv[3];
    
    if (!scriptsDir || !outputPath) {
        console.error('Usage: node compile-lua.js <scripts-dir> <output-path>');
        process.exit(1);
    }
    
    const success = compileScripts(scriptsDir, outputPath);
    process.exit(success ? 0 : 1);
}

module.exports = { compileScripts };