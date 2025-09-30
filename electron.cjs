const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  console.log('🚀 Creating Electron window...');
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: process.platform === 'win32' 
      ? path.join(__dirname, 'assets/icons/appIcon.ico')
      : path.join(__dirname, 'assets/icons/appIcon.png'),
    title: 'Mango Cannabis Flower Menu Builder',
    titleBarStyle: 'default',
    frame: true,
    backgroundColor: '#1f2937', // Dark gray background while loading
    show: false, // Don't show until ready
    center: true, // Center the window on screen
    resizable: true,
    maximizable: true,
    minimizable: true,
    fullscreenable: true,
    // Windows specific improvements with overlay
    ...(process.platform === 'win32' && {
      titleBarOverlay: {
        color: '#f97316', // Mango orange color for title bar
        symbolColor: '#ffffff', // White symbols
        height: 32
      }
    }),
    // macOS specific improvements with hidden title bar
    ...(process.platform === 'darwin' && {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 15, y: 15 },
      transparent: false,
      vibrancy: 'window'
    })
  });

  // Load the app
  console.log('🔍 Loading app content...');
  if (isDev) {
    const devUrl = process.env.VITE_DEV_URL || 'http://localhost:5173';
    console.log('🌐 Loading dev URL:', devUrl);
    mainWindow.loadURL(devUrl);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'dist/index.html');
    console.log('📁 Loading file:', indexPath);
    // Disable cache for production to ensure latest changes are loaded
    mainWindow.webContents.session.clearCache();
    mainWindow.loadFile(indexPath);
  }

  // Add error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Content loaded successfully');
  });

  // Show window when ready with a nice fade-in effect
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Electron window ready to show');
    mainWindow.show();
    
    // Explicitly set icon for Windows (helps with taskbar/start menu)
    if (process.platform === 'win32') {
      mainWindow.setIcon(path.join(__dirname, 'assets/icons/appIcon.ico'));
      mainWindow.flashFrame(false);
    }
    
    // Focus the window
    mainWindow.focus();
    console.log('✅ Electron window shown and focused');
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  // Prevent external links from opening in the app
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Handle external links by opening them in the default browser
  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });

  return mainWindow;
}

// Helper function to send commands to renderer
function sendToRenderer(command, data = null) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('menu-command', { command, data });
  }
}

// Helper function to show confirmation dialog
async function showConfirmDialog(message, detail = '') {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancel', 'Continue'],
    defaultId: 0,
    cancelId: 0,
    message,
    detail
  });
  return result.response === 1; // Returns true if user clicked "Continue"
}

// Create application menu with dynamic data
function createMenu(dynamicData = { shelves: [], darkMode: false, fiftyPercentOffEnabled: false }) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Menu',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendToRenderer('new-menu')
        },
        {
          label: 'Open Menu',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendToRenderer('open-menu')
        },
        { type: 'separator' },
        {
          label: 'Switch Menu Mode',
          accelerator: 'CmdOrCtrl+M',
          click: () => sendToRenderer('switch-menu-mode')
        },
        { type: 'separator' },
        {
          label: 'Switch State',
          submenu: [
            {
              label: 'Oklahoma',
              click: () => sendToRenderer('switch-state', 'oklahoma')
            },
            {
              label: 'Michigan', 
              click: () => sendToRenderer('switch-state', 'michigan')
            },
            {
              label: 'New Mexico',
              click: () => sendToRenderer('switch-state', 'new_mexico')
            },
            {
              label: 'New York',
              click: () => sendToRenderer('switch-state', 'new_york')
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Export Menu',
          submenu: [
            {
              label: 'Export as CSV',
              accelerator: 'CmdOrCtrl+Shift+E',
              click: () => sendToRenderer('export-csv')
            },
            {
              label: 'Export as PNG',
              accelerator: 'CmdOrCtrl+Shift+P', 
              click: () => sendToRenderer('export-png')
            },
            {
              label: 'Export as JPEG',
              accelerator: 'CmdOrCtrl+Shift+J',
              click: () => sendToRenderer('export-jpeg')
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            console.log('Quit menu clicked');
            if (mainWindow && mainWindow.webContents) {
              // First try to send to renderer for graceful quit
              sendToRenderer('quit-app');
              // Also add direct quit as fallback after a short delay
              setTimeout(() => {
                console.log('Force quitting application');
                app.quit();
              }, 1000);
            } else {
              app.quit();
            }
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Add Strain',
          accelerator: 'CmdOrCtrl+Shift+A',
          submenu: [
            {
              label: 'Add to Last Used Shelf',
              click: () => sendToRenderer('add-strain-last')
            },
            { type: 'separator' },
            // Dynamic shelf options
            ...dynamicData.shelves.map(shelf => ({
              label: shelf.name,
              click: () => sendToRenderer('add-strain-to-shelf', shelf.id)
            }))
          ]
        },
        { type: 'separator' },
        {
          label: 'Global Sort',
          submenu: [
            {
              label: 'Name',
              click: () => sendToRenderer('global-sort', 'name')
            },
            {
              label: 'Grower',
              click: () => sendToRenderer('global-sort', 'grower')
            },
            {
              label: 'Class',
              click: () => sendToRenderer('global-sort', 'class')
            },
            {
              label: 'THC%',
              click: () => sendToRenderer('global-sort', 'thc')
            },
            {
              label: 'Last Jar',
              click: () => sendToRenderer('global-sort', 'lastjar')
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Clear All Shelves',
          click: () => sendToRenderer('clear-all-shelves')
        },
        {
          label: 'Clear All Last Jars',
          click: () => sendToRenderer('clear-all-last-jars')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dark Mode',
          type: 'checkbox',
          checked: dynamicData.darkMode,
          accelerator: 'CmdOrCtrl+T',
          click: (menuItem) => sendToRenderer('toggle-dark-mode', menuItem.checked)
        },
        {
          label: '50% OFF Shelf',
          type: 'checkbox',
          checked: dynamicData.fiftyPercentOffEnabled,
          click: () => sendToRenderer('toggle-fifty-percent-off')
        },
        { type: 'separator' },
        {
          label: 'Jump to Shelf',
          submenu: [
            // Dynamic shelf options for jumping/scrolling
            ...dynamicData.shelves.map(shelf => ({
              label: shelf.name,
              click: () => sendToRenderer('jump-to-shelf', shelf.id)
            }))
          ]
        },
        { type: 'separator' },
        {
          label: 'Zoom',
          submenu: [
            {
              label: 'Zoom In',
              accelerator: 'CmdOrCtrl+=',
              click: () => sendToRenderer('zoom-in')
            },
            {
              label: 'Zoom Out', 
              accelerator: 'CmdOrCtrl+-',
              click: () => sendToRenderer('zoom-out')
            },
            {
              label: 'Reset Zoom',
              accelerator: 'CmdOrCtrl+\\',
              click: () => sendToRenderer('reset-zoom')
            },
            { type: 'separator' },
            {
              label: '25%',
              click: () => sendToRenderer('set-zoom', 0.25)
            },
            {
              label: '50%',
              click: () => sendToRenderer('set-zoom', 0.5)
            },
            {
              label: '75%',
              click: () => sendToRenderer('set-zoom', 0.75)
            },
            {
              label: '100%',
              click: () => sendToRenderer('set-zoom', 1.0)
            },
            {
              label: '125%',
              click: () => sendToRenderer('set-zoom', 1.25)
            },
            {
              label: '150%',
              click: () => sendToRenderer('set-zoom', 1.5)
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Fit to Window',
          accelerator: 'CmdOrCtrl+F',
          click: () => sendToRenderer('fit-to-window')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates...',
          accelerator: 'CmdOrCtrl+U',
          click: () => sendToRenderer('check-for-updates-manual')
        },
        { type: 'separator' },
        {
          label: 'Reset App Data',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => sendToRenderer('reset-app-data')
        },
        { type: 'separator' },
        {
          label: 'Instructions',
          accelerator: 'F1',
          click: () => sendToRenderer('show-instructions')
        },
        { type: 'separator' },
        {
          label: 'About Mango Menu Builder',
          click: () => sendToRenderer('show-about')
        }
      ]
    }
  ];

  // Add development menu only in development mode
  if (isDev) {
    template.push({
      label: 'Development',
      submenu: [
        {
          label: 'Clear localStorage',
          accelerator: 'CmdOrCtrl+Shift+Delete',
          click: () => sendToRenderer('clear-localstorage')
        },
        {
          label: 'Reset to Welcome State',
          click: () => sendToRenderer('reset-welcome-state')
        },
        { type: 'separator' },
        {
          label: 'Open DevTools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.openDevTools();
            }
          }
        }
             ]
     });
   }

  // Create and set the application menu to enable keyboard shortcuts
  // but hide the menu bar since we use custom HeaderTabs
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  // Hide the menu bar on Windows/Linux (macOS always shows app menu)
  if (mainWindow) {
    mainWindow.setMenuBarVisibility(false);
  }
  
  return menu;
}

// Function to update menu with dynamic data (shelves, dark mode state)
async function updateMenuWithDynamicData(dynamicData) {
  try {
    createMenu(dynamicData);
    return true;
  } catch (error) {
    console.error('Error updating menu:', error);
    return false;
  }
}

// IPC handlers - keeping original handlers only for now
ipcMain.handle('show-confirm-dialog', async (event, message, detail) => {
  return await showConfirmDialog(message, detail);
});

ipcMain.handle('update-menu-state', async (event, updates) => {
  return true;
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

// Show save dialog
ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: options.title || 'Save Project',
      defaultPath: options.suggestedName || 'project.json',
      filters: options.filters || [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error showing save dialog:', error);
    throw error;
  }
});

// Show open dialog
ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title || 'Open Project',
      filters: options.filters || [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    return result;
  } catch (error) {
    console.error('Error showing open dialog:', error);
    throw error;
  }
});

// Write file to disk
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    const fs = require('fs');
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});

// Read file content from disk
ipcMain.handle('read-file-content', async (event, filePath) => {
  try {
    const fs = require('fs');
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (error) {
    console.error('Error reading file content:', error);
    throw error;
  }
});

ipcMain.handle('update-dynamic-menus', async (event, menuData) => {
  try {
    await updateMenuWithDynamicData(menuData);
    return true;
  } catch (error) {
    console.error('Error updating dynamic menus:', error);
    throw error;
  }
});

// Auto-updater configuration and handlers
let updateInfo = null;

// Configure auto-updater (only in production)
if (!isDev) {
  // Configure GitHub releases
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'TheBurd',
    repo: 'mango-cannabis-flower-menu-builder'
    // Repository is public, no token needed
  });

  // Log update source for verification
  console.log('[Updater] Update source configured:', autoUpdater.getFeedURL());

  // Configure auto-updater to download but not apply automatically
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  // Auto-updater event handlers
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for update...');
    console.log('Feed URL:', autoUpdater.getFeedURL());
    // Send debug info to renderer
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-debug', {
        type: 'checking',
        message: 'Checking for updates...',
        currentVersion: app.getVersion(),
        feedUrl: autoUpdater.getFeedURL()
      });
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('🎉 Update available:', JSON.stringify(info, null, 2));
    updateInfo = info;
    // Send update available info to renderer (don't auto-download)
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      });
      mainWindow.webContents.send('update-debug', {
        type: 'available',
        message: `Update available: ${info.version} - waiting for user choice`,
        info: info
      });
    }
    // NOTE: Removed auto-download - user must choose to download
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('❌ Update not available:', JSON.stringify(info, null, 2));
    console.log('Current version:', app.getVersion());
    updateInfo = null;
    // Send not-available event to renderer
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-not-available', info);
      mainWindow.webContents.send('update-debug', {
        type: 'not-available',
        message: 'No updates available',
        currentVersion: app.getVersion(),
        info: info
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('🚨 Auto-updater error:', err);
    console.error('Error stack:', err.stack);
    updateInfo = null;
    // Send enhanced error info to renderer with manual fallback
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-error', {
        message: 'Update failed. Please download manually from GitHub.',
        originalError: err.message,
        stack: err.stack,
        manualDownloadUrl: 'https://github.com/TheBurd/mango-cannabis-flower-menu-builder/releases'
      });
      // Also send to debug for development
      mainWindow.webContents.send('update-debug', {
        type: 'error',
        message: `Update error: ${err.message}`,
        error: err.toString(),
        stack: err.stack
      });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    
    // Send progress to renderer
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Update downloaded successfully:', JSON.stringify(info, null, 2));
    // Send update downloaded info to renderer
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version
      });
      mainWindow.webContents.send('update-debug', {
        type: 'downloaded',
        message: `Update ${info.version} downloaded and ready to install`,
        info: info
      });
    }
  });
}

// IPC handlers for update functionality
ipcMain.handle('check-for-updates', async () => {
  if (!isDev) {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
      throw error;
    }
  }
  return null;
});

ipcMain.handle('download-update', async () => {
  if (!isDev && updateInfo) {
    try {
      await autoUpdater.downloadUpdate();
      return true;
    } catch (error) {
      console.error('Error downloading update:', error);
      throw error;
    }
  }
  return false;
});

ipcMain.handle('install-update', async () => {
  if (!isDev) {
    // This will quit the app and install the update
    autoUpdater.quitAndInstall();
    return true;
  }
  return false;
});

ipcMain.handle('get-update-info', async () => {
  return updateInfo;
});

ipcMain.handle('get-current-version', async () => {
  return app.getVersion();
});

ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
  return true;
});

// Window control IPC handlers for custom title bar
ipcMain.handle('window-minimize', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle('window-maximize', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('window-close', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
    return true;
  }
  return false;
});

ipcMain.handle('window-is-maximized', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow.isMaximized();
  }
  return false;
});

// Header preferences storage
ipcMain.handle('get-header-preferences', async () => {
  // Return default preferences if none stored
  return {
    activeTab: 'file',
    pinnedActions: ['mode-toggle', 'auto-format', 'export'],
    showQuickActions: true,
    compactMode: false
  };
});

ipcMain.handle('set-header-preferences', async (event, preferences) => {
  // In a real implementation, you'd store these in a file or database
  console.log('Saving header preferences:', preferences);
  return true;
});

// Function to check for updates on startup
function checkForUpdatesOnStartup() {
  if (!isDev) {
    // Check for updates 5 seconds after app is ready
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        console.error('Error checking for updates on startup:', err);
      });
    }, 5000);
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set app icon explicitly for Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.mangocannabis.flowerMenuBuilder');
  }
  
  createWindow();
  createMenu();
  
  // Check for updates on startup
  checkForUpdatesOnStartup();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

 