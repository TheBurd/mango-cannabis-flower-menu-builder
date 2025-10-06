const { contextBridge, ipcRenderer } = require('electron');



// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Listen for menu commands from main process
  onMenuCommand: (callback) => {
    return ipcRenderer.on('menu-command', callback);
  },
  
  // Remove all listeners for menu commands
  removeAllListeners: () => {
    return ipcRenderer.removeAllListeners('menu-command');
  },
  
  // Show confirmation dialog
  showConfirmDialog: (message, detail) => {
    return ipcRenderer.invoke('show-confirm-dialog', message, detail);
  },
  
  // Update menu state (checkboxes, etc.)
  updateMenuState: (updates) => {
    return ipcRenderer.invoke('update-menu-state', updates);
  },
  
  // Read file from file path
  readFile: (filePath) => {
    return ipcRenderer.invoke('read-file', filePath);
  },
  
  // Show save dialog and write file
  showSaveDialog: (options) => {
    return ipcRenderer.invoke('show-save-dialog', options);
  },
  
  // Show open dialog
  showOpenDialog: (options) => {
    return ipcRenderer.invoke('show-open-dialog', options);
  },
  
  // Write file to disk
  writeFile: (filePath, content) => {
    return ipcRenderer.invoke('write-file', filePath, content);
  },
  
  // Read file from disk
  readFileContent: (filePath) => {
    return ipcRenderer.invoke('read-file-content', filePath);
  },
  
  // Update dynamic menu items (shelves for Add Strain and Jump to Shelf)
  updateDynamicMenus: (menuData) => {
    return ipcRenderer.invoke('update-dynamic-menus', menuData);
  },
  
  // Auto-updater methods
  checkForUpdates: () => {
    return ipcRenderer.invoke('check-for-updates');
  },
  
  downloadUpdate: () => {
    return ipcRenderer.invoke('download-update');
  },
  
  installUpdate: () => {
    return ipcRenderer.invoke('install-update');
  },
  
  getUpdateInfo: () => {
    return ipcRenderer.invoke('get-update-info');
  },

  getCurrentVersion: () => {
    return ipcRenderer.invoke('get-current-version');
  },

  openExternal: (url) => {
    return ipcRenderer.invoke('open-external', url);
  },

  getUpdateSettings: () => {
    return ipcRenderer.invoke('get-update-settings');
  },

  setUpdateSettings: (settings) => {
    return ipcRenderer.invoke('set-update-settings', settings);
  },

  onUpdateSettingsChanged: (callback) => {
    return ipcRenderer.on('update-settings-changed', callback);
  },

  removeUpdateSettingsListeners: () => {
    ipcRenderer.removeAllListeners('update-settings-changed');
  },

  // Window controls for custom title bar
  windowMinimize: () => {
    return ipcRenderer.invoke('window-minimize');
  },

  windowMaximize: () => {
    return ipcRenderer.invoke('window-maximize');
  },

  windowClose: () => {
    return ipcRenderer.invoke('window-close');
  },

  windowIsMaximized: () => {
    return ipcRenderer.invoke('window-is-maximized');
  },

  // Header preferences
  getHeaderPreferences: () => {
    return ipcRenderer.invoke('get-header-preferences');
  },

  setHeaderPreferences: (preferences) => {
    return ipcRenderer.invoke('set-header-preferences', preferences);
  },
  
  // Listen for update events
  onUpdateAvailable: (callback) => {
    return ipcRenderer.on('update-available', callback);
  },
  
  onDownloadProgress: (callback) => {
    return ipcRenderer.on('download-progress', callback);
  },
  
  onUpdateDownloaded: (callback) => {
    return ipcRenderer.on('update-downloaded', callback);
  },
  
  onUpdateDebug: (callback) => {
    return ipcRenderer.on('update-debug', callback);
  },

  onUpdateNotAvailable: (callback) => {
    return ipcRenderer.on('update-not-available', callback);
  },

  onUpdateError: (callback) => {
    return ipcRenderer.on('update-error', callback);
  },
  
  // Remove update listeners
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.removeAllListeners('update-debug');
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.removeAllListeners('update-error');
  }
});



// Set a flag that can be checked by the renderer
window.electronPreloadLoaded = true; 
