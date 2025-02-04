const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [{ name: 'JSON Files', extensions: ['json'] }]
            });
            
            if (filePaths.length > 0) {
              const data = fs.readFileSync(filePaths[0], 'utf-8');
              win.webContents.send('project-loaded', JSON.parse(data));
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});