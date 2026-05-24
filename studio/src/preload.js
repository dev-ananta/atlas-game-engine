const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // File operations
  saveProject: (projectPath, data) => ipcRenderer.invoke('save-project', projectPath, data),
  loadProject: (projectPath) => ipcRenderer.invoke('load-project', projectPath),
  importAsset: (sourcePath, projectPath) => ipcRenderer.invoke('import-asset', sourcePath, projectPath),
  
  // Git operations
  gitInit: (projectPath) => ipcRenderer.invoke('git-init', projectPath),
  gitCommit: (projectPath, message) => ipcRenderer.invoke('git-commit', projectPath, message),
  gitStatus: (projectPath) => ipcRenderer.invoke('git-status', projectPath),
  
  // Dialog operations
  openDialog: (options) => ipcRenderer.invoke('open-dialog', options),
  saveDialog: (options) => ipcRenderer.invoke('save-dialog', options),
});