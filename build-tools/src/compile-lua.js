const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function compileScripts(scriptsDir, outputPath) {
  console.log('Compiling Lua scripts from:', scriptsDir);

  const bundle = {
    version: '1.1.0',
    scripts: {},
  };

  if (!fs.existsSync(scriptsDir)) {
    console.warn('Scripts directory not found, generating empty script bundle.');
  } else {
    function walkDir(dir, baseDir) {
      for (const file of fs.readdirSync(dir)) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath, baseDir);
        } else if (file.endsWith('.lua')) {
          const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
          const code = fs.readFileSync(filePath, 'utf8');
          const hash = crypto.createHash('sha256').update(code, 'utf8').digest('hex');

          bundle.scripts[relativePath] = {
            language: 'lua',
            encoding: 'utf8',
            hash,
            source: code,
          };

          console.log(`  Compiled: ${relativePath} (${code.length} bytes)`);
        }
      }
    }

    walkDir(scriptsDir, scriptsDir);
  }

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2));

  console.log(`✓ Script bundle created: ${outputPath}`);
  console.log(`  Total scripts: ${Object.keys(bundle.scripts).length}`);

  return true;
}

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
