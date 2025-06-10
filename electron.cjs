const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
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
    icon: isDev 
      ? path.join(__dirname, 'assets/icons/appIcon.png')
      : path.join(__dirname, 'assets/icons/appIcon.png'),
    title: 'Mango Cannabis Flower Menu Builder',
    titleBarStyle: 'default',
    backgroundColor: '#1f2937', // Dark gray background while loading
    show: false, // Don't show until ready
    center: true, // Center the window on screen
    resizable: true,
    maximizable: true,
    minimizable: true,
    fullscreenable: true,
    // Better window frame on Windows
    ...(process.platform === 'win32' && {
      titleBarStyle: 'default',
      frame: true
    }),
    // macOS specific improvements
    ...(process.platform === 'darwin' && {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 20, y: 20 }
    })
  });

  // Load the app
  if (isDev) {
    const devUrl = process.env.VITE_DEV_URL || 'http://localhost:5173';
    mainWindow.loadURL(devUrl);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready with a nice fade-in effect
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Optional: Flash the window to draw attention (Windows only)
    if (process.platform === 'win32') {
      mainWindow.flashFrame(false);
    }
    
    // Focus the window
    mainWindow.focus();
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
function createMenu(dynamicData = { shelves: [], darkMode: false }) {
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
          click: async () => {
            try {
              const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile'],
                filters: [
                  { name: 'CSV Files', extensions: ['csv'] }
                ]
              });
              
              if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                sendToRenderer('open-menu-file', filePath);
              }
            } catch (error) {
              console.error('Error opening file dialog:', error);
            }
          }
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
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Export Menu',
          submenu: [
            {
              label: 'Export as CSV',
              accelerator: 'Alt+Shift+C',
              click: () => sendToRenderer('export-csv')
            },
            {
              label: 'Export as PNG',
              accelerator: 'Alt+Shift+P', 
              click: () => sendToRenderer('export-png')
            },
            {
              label: 'Export as JPEG',
              accelerator: 'Alt+Shift+J',
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
          click: (menuItem) => sendToRenderer('toggle-dark-mode', menuItem.checked)
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
              accelerator: 'Ctrl+=',
              click: () => sendToRenderer('zoom-in')
            },
            {
              label: 'Zoom Out', 
              accelerator: 'Ctrl+-',
              click: () => sendToRenderer('zoom-out')
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

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  return menu;
}

// Function to update menu with dynamic data (shelves, dark mode state)
async function updateMenuWithDynamicData(dynamicData) {
  const newMenu = createMenu(dynamicData);
  Menu.setApplicationMenu(newMenu);
}

// IPC handlers
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

ipcMain.handle('update-dynamic-menus', async (event, menuData) => {
  try {
    await updateMenuWithDynamicData(menuData);
    return true;
  } catch (error) {
    console.error('Error updating dynamic menus:', error);
    throw error;
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  createMenu();

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

 