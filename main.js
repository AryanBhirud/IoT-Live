const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

ipcMain.on('deploy-firmware', (event, taskGroups) => {
  dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Deployment Directory'
  }).then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
          const basePath = result.filePaths[0];
          createDeploymentStructure(basePath, taskGroups);
      }
  });
});

function sanitizeName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase();
}

function createDeploymentStructure(basePath, taskGroups) {
  const deploymentDir = path.join(basePath, 'firmware_deployment');
  
  try {
      fs.mkdirSync(deploymentDir, { recursive: true });
      
      Object.values(taskGroups).forEach((group, index) => {
          const taskName = group.task || `task_${index + 1}`;
          const cleanName = sanitizeName(taskName);
          const taskDir = path.join(deploymentDir, `div${index + 1}_${cleanName}`);
          
          // Create task directory
          fs.mkdirSync(taskDir, { recursive: true });
          
          // Create main.cpp
          const mainCppContent = `// Firmware for task: ${taskName}\n// Devices: ${group.devices.map(d => d.id).join(', ')}\n`;
          fs.writeFileSync(path.join(taskDir, 'main.cpp'), mainCppContent);
          
          // Create build directory and firmware.bin
          const buildDir = path.join(taskDir, 'build');
          fs.mkdirSync(buildDir);
          fs.writeFileSync(path.join(buildDir, 'firmware.bin'), 'Firmware binary placeholder');
      });
      
      dialog.showMessageBox({
          type: 'info',
          title: 'Deployment Successful',
          message: 'File structure created successfully!',
          detail: `Location: ${deploymentDir}`
      });
  } catch (error) {
      dialog.showErrorBox('Deployment Error', `Failed to create structure: ${error.message}`);
  }
}

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