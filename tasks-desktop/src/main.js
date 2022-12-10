const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'home/home.html'));
};

app.on('ready', () => {
  createWindow()

  Menu.setApplicationMenu(null);
});
