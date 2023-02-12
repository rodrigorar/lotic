const { BrowserWindow } = require('electron');
const path = require('path');

let loginWindow;


function handleOpenLogin(event) {
    console.log('Handling open login');

    loginWindow = new BrowserWindow({
        width: 400,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '../preload.js'),
        },
    });
      
    loginWindow.loadFile(path.join(__dirname, '../ui/login/login.html'));
}

function handleLogin(event, loginData) {
    console.log('Login in');
    console.log(loginData);

    loginWindow.webContents.destroy();
    loginWindow = undefined;

}

module.exports.AuthHandlers = {
    handleOpenLogin
    , handleLogin
}