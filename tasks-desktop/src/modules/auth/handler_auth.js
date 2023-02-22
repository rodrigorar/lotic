const { BrowserWindow } = require('electron');
const path = require('path');
const { AuthServices } = require('./services');
const { SynchManager } = require('../synch-manager');

let loginWindow;


async function handleOpenLogin(event) {
    if (loginWindow == undefined) {
        const activeSession = await AuthServices.getActiveSession();
        loginWindow = new BrowserWindow({
            width: 400,
            height: 200,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, '../../preload.js'),
            },
        });
        loginWindow.on('closed', () => {
            loginWindow = undefined;
        });
        
        const authFile = 
            activeSession == undefined 
                ? '../../ui/login/login.html' 
                : '../../ui/login/logged_in.html';
        loginWindow.loadFile(path.join(__dirname, authFile));
    }
}

async function handleLogin(event, loginData) {
    loginWindow.destroy();
    loginWindow = undefined;

    await AuthServices.login(loginData);
    await SynchManager.execute();
}

module.exports.AuthHandlers = {
    handleOpenLogin
    , handleLogin
}