const { BrowserWindow, webContents } = require('electron');
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
    } else {
        loginWindow.focus();
    }
}

async function handleLogin(event, loginData) {
    loginWindow.destroy();
    loginWindow = undefined;

    await AuthServices.login(loginData);
    await SynchManager.execute();

    webContents.getFocusedWebContents().send('auth:logged_in');
}

async function handleLogout(event) {
    const activeSession = await AuthServices.getActiveSession();
    await AuthServices.logout(activeSession);

    webContents.getFocusedWebContents().send('auth:logged_out');
}

async function handleIsLoggedIn(event) {
    const activeSession = await AuthServices.getActiveSession();
    return activeSession != undefined;
}

module.exports.AuthHandlers = {
    handleOpenLogin
    , handleLogin
    , handleLogout
    , handleIsLoggedIn
}