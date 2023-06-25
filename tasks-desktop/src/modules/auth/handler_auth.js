const { BrowserWindow, webContents } = require('electron');
const path = require('path');
const { AuthServicesInstance } = require('./services');
const { SynchManager } = require('../synch-manager');
const { RunUnitOfWork } = require("../../shared/persistence/unitofwork");

let loginWindow;

async function handleOpenLogin(event) {
    if (loginWindow == undefined) {
        
        const activeSession = await RunUnitOfWork.run(async (unitOfWork) => {
            return await AuthServicesInstance.getActiveSession(unitOfWork);
        });

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

    await RunUnitOfWork.run(async (unitOfWork) => {
        await AuthServicesInstance.login(unitOfWork, loginData);
    });

    await SynchManager.execute();

    webContents.getFocusedWebContents().send('auth:logged_in');
}

async function handleLogout(event) {
    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await AuthServicesInstance.getActiveSession(unitOfWork);
        await AuthServicesInstance.logout(unitOfWork, activeSession);
    });
    
    webContents.getFocusedWebContents().send('auth:logged_out');
}

async function handleIsLoggedIn(event) {
    return await RunUnitOfWork.run(async (unitOfWork) => {
        return await AuthServicesInstance.getActiveSession(unitOfWork);
    }) != undefined;
}

module.exports.AuthHandlers = {
    handleOpenLogin
    , handleLogin
    , handleLogout
    , handleIsLoggedIn
}