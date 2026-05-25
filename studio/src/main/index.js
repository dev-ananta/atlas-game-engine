const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git');

let mainWindow;

const QUALITY_PROFILES = {
  Ultra: { minCpuCores: 12, minMemoryGB: 16 },
  High: { minCpuCores: 8, minMemoryGB: 12 },
  Medium: { minCpuCores: 6, minMemoryGB: 8 },
  Low: { minCpuCores: 4, minMemoryGB: 4 },
  Potato: { minCpuCores: 2, minMemoryGB: 2 },
};



function sanitizeProjectName(projectName) {
  const reserved = new Set(['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']);
  const candidate = (projectName || 'AtlasGame').trim().replace(/[<>:"/\|?*]/g, '_').replace(/\.+$/g, '').trim();
  if (!candidate || reserved.has(candidate.toUpperCase())) {
    return 'AtlasGame';
  }
  return candidate;
}
function createDefaultManifest(projectName) {
  const now = new Date().toISOString();
  return {
    formatVersion: '1.1.0',
    metadata: {
      title: projectName,
      creator: 'Unknown Creator',
      releaseDate: null,
      genre: 'Unknown',
      description: '',
      coverArt: null,
      version: '0.1.0',
      assetQualityTiers: ['Ultra', 'High', 'Medium', 'Low', 'Potato'],
      recommendedHardware: QUALITY_PROFILES,
      distribution: 'open',
    },
    runtime: {
      entryScene: 'scene.main',
    },
    qualityProfiles: QUALITY_PROFILES,
    scene: {
      metadata: {
        name: 'Main Scene',
        created: now,
        modified: now,
        description: '',
      },
      entities: [],
      assetRegistry: {
        models: [],
        textures: [],
        scripts: [],
        audio: [],
      },
    },
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'Atlas Game Engine Studio',
  });

  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('create-project', async (event, targetDirectory, projectName) => {
  try {
    const safeName = sanitizeProjectName(projectName);
    const projectPath = path.join(targetDirectory, safeName);

    await fs.promises.mkdir(path.join(projectPath, 'assets', 'models'), { recursive: true });
    await fs.promises.mkdir(path.join(projectPath, 'assets', 'textures'), { recursive: true });
    await fs.promises.mkdir(path.join(projectPath, 'assets', 'audio'), { recursive: true });
    await fs.promises.mkdir(path.join(projectPath, 'scripts'), { recursive: true });

    const manifest = createDefaultManifest(safeName);
    await fs.promises.writeFile(path.join(projectPath, 'scene.manifest'), JSON.stringify(manifest, null, 2), 'utf8');

    return { success: true, projectPath, manifest };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-project', async (event, projectPath, data) => {
  try {
    const manifestPath = path.join(projectPath, 'scene.manifest');
    await fs.promises.writeFile(manifestPath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-project', async (event, projectPath) => {
  try {
    const manifestPath = path.join(projectPath, 'scene.manifest');
    const data = await fs.promises.readFile(manifestPath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-dialog', async (event, options) => dialog.showOpenDialog(mainWindow, options));
ipcMain.handle('save-dialog', async (event, options) => dialog.showSaveDialog(mainWindow, options));

ipcMain.handle('import-asset', async (event, sourcePath, projectPath) => {
  try {
    const fileName = path.basename(sourcePath);
    const ext = path.extname(fileName).toLowerCase();

    let targetDir;
    let category;
    if (['.obj', '.fbx', '.gltf', '.glb'].includes(ext)) {
      targetDir = path.join(projectPath, 'assets', 'models');
      category = 'models';
    } else if (['.png', '.jpg', '.jpeg', '.bmp', '.tga'].includes(ext)) {
      targetDir = path.join(projectPath, 'assets', 'textures');
      category = 'textures';
    } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
      targetDir = path.join(projectPath, 'assets', 'audio');
      category = 'audio';
    } else if (['.lua'].includes(ext)) {
      targetDir = path.join(projectPath, 'scripts');
      category = 'scripts';
    } else {
      throw new Error('Unsupported file type');
    }

    await fs.promises.mkdir(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, fileName);
    await fs.promises.copyFile(sourcePath, targetPath);

    return { success: true, category, path: path.relative(projectPath, targetPath).replace(/\\/g, '/') };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-init', async (event, projectPath) => {
  try {
    const git = simpleGit(projectPath);
    await git.init();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-commit', async (event, projectPath, message) => {
  try {
    const git = simpleGit(projectPath);
    await git.add('.');
    await git.commit(message || 'Update project');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-status', async (event, projectPath) => {
  try {
    const git = simpleGit(projectPath);
    const status = await git.status();
    return { success: true, status };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
