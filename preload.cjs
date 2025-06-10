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
  
  // Update dynamic menu items (shelves for Add Strain and Jump to Shelf)
  updateDynamicMenus: (menuData) => {
    return ipcRenderer.invoke('update-dynamic-menus', menuData);
  }
});



// Set a flag that can be checked by the renderer
window.electronPreloadLoaded = true; 