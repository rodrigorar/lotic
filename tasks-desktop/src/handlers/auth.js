const { BrowserWindow } = require('electron');
const path = require('path');
const { AuthServices } = require('../modules/auth/services');

let loginWindow;


async function handleOpenLogin(event) {
    const activeSession = await AuthServices.getActiveSession();
    loginWindow = new BrowserWindow({
        width: 400,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '../preload.js'),
        },
    });
      
    console.log(activeSession);
    const authFile = 
        activeSession == undefined 
            ? '../ui/login/login.html' 
            : '../ui/login/logged_in.html';
    loginWindow.loadFile(path.join(__dirname, authFile));
}

function handleLogin(event, loginData) {
    loginWindow.destroy();
    AuthServices.login(loginData);
}

module.exports.AuthHandlers = {
    handleOpenLogin
    , handleLogin
}