const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  createProject: (targetDirectory, projectName) => ipcRenderer.invoke('create-project', targetDirectory, projectName),
  saveProject: (projectPath, data) => ipcRenderer.invoke('save-project', projectPath, data),
  loadProject: (projectPath) => ipcRenderer.invoke('load-project', projectPath),
  importAsset: (sourcePath, projectPath) => ipcRenderer.invoke('import-asset', sourcePath, projectPath),

  gitInit: (projectPath) => ipcRenderer.invoke('git-init', projectPath),
  gitCommit: (projectPath, message) => ipcRenderer.invoke('git-commit', projectPath, message),
  gitStatus: (projectPath) => ipcRenderer.invoke('git-status', projectPath),

  openDialog: (options) => ipcRenderer.invoke('open-dialog', options),
  saveDialog: (options) => ipcRenderer.invoke('save-dialog', options),
});
