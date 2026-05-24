const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const simpleGit = require('simple-git');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'GameEngine Studio',
    icon: path.join(__dirname, '../../public/icons/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

  // Open DevTools in development mode
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

// IPC Handlers for file operations
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

ipcMain.handle('import-asset', async (event, sourcePath, projectPath) => {
  try {
    const fileName = path.basename(sourcePath);
    const ext = path.extname(fileName).toLowerCase();
    
    let targetDir;
    if (['.obj', '.fbx', '.gltf'].includes(ext)) {
      targetDir = path.join(projectPath, 'assets', 'models');
    } else if (['.png', '.jpg', '.jpeg', '.bmp'].includes(ext)) {
      targetDir = path.join(projectPath, 'assets', 'textures');
    } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
      targetDir = path.join(projectPath, 'assets', 'audio');
    } else {
      throw new Error('Unsupported file type');
    }

    await fs.promises.mkdir(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, fileName);
    await fs.promises.copyFile(sourcePath, targetPath);
    
    return { success: true, path: path.relative(projectPath, targetPath) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Git integration handlers
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
    await git.commit(message);
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