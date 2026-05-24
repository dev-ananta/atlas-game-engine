const fs = require('fs');
const path = require('path');

function validateManifest(manifestPath) {
    console.log('Validating manifest:', manifestPath);
    
    // Read manifest file
    let manifest;
    try {
        const content = fs.readFileSync(manifestPath, 'utf8');
        manifest = JSON.parse(content);
    } catch (error) {
        console.error('Error reading manifest:', error.message);
        return false;
    }
    
    // Validate structure
    if (!manifest.version) {
        console.error('Missing version field');
        return false;
    }
    
    if (!manifest.scene) {
        console.error('Missing scene field');
        return false;
    }
    
    if (!manifest.scene.entities || !Array.isArray(manifest.scene.entities)) {
        console.error('Invalid or missing entities array');
        return false;
    }
    
    // Validate entities
    for (let i = 0; i < manifest.scene.entities.length; i++) {
        const entity = manifest.scene.entities[i];
        
        if (!entity.id) {
            console.error(`Entity ${i} missing id`);
            return false;
        }
        
        if (!entity.name) {
            console.error(`Entity ${entity.id} missing name`);
            return false;
        }
        
        if (!entity.transform) {
            console.error(`Entity ${entity.id} missing transform`);
            return false;
        }
        
        // Validate transform
        if (!entity.transform.position || entity.transform.position.length !== 3) {
            console.error(`Entity ${entity.id} has invalid position`);
            return false;
        }
        
        if (!entity.transform.rotation || entity.transform.rotation.length !== 3) {
            console.error(`Entity ${entity.id} has invalid rotation`);
            return false;
        }
        
        if (!entity.transform.scale || entity.transform.scale.length !== 3) {
            console.error(`Entity ${entity.id} has invalid scale`);
            return false;
        }
    }
    
    // Validate asset registry
    if (manifest.scene.assetRegistry) {
        const registry = manifest.scene.assetRegistry;
        
        // Check that referenced assets exist
        const projectDir = path.dirname(manifestPath);
        
        if (registry.models) {
            for (const model of registry.models) {
                const modelPath = path.join(projectDir, model);
                if (!fs.existsSync(modelPath)) {
                    console.warn(`Referenced model not found: ${model}`);
                }
            }
        }
        
        if (registry.textures) {
            for (const texture of registry.textures) {
                const texturePath = path.join(projectDir, texture);
                if (!fs.existsSync(texturePath)) {
                    console.warn(`Referenced texture not found: ${texture}`);
                }
            }
        }
        
        if (registry.scripts) {
            for (const script of registry.scripts) {
                const scriptPath = path.join(projectDir, script);
                if (!fs.existsSync(scriptPath)) {
                    console.warn(`Referenced script not found: ${script}`);
                }
            }
        }
    }
    
    console.log('✓ Manifest validation successful');
    return true;
}

// CLI usage
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
    
    const isValid = validateManifest(manifestPath);
    process.exit(isValid ? 0 : 1);
}

module.exports = { validateManifest };