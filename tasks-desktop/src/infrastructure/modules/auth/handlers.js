const { BrowserWindow, webContents } = require('electron');
const path = require('path');
const { UseCaseLoginProvider, UseCaseGetActiveSessionProvider, UseCaseLogoutProvider } = require("./providers");
const { SynchManager } = require("../sync/synch-manager");
const { RunUnitOfWork } = require("../../persistence/unitofwork");

let loginWindow;

async function handleOpenLogin(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();

    if (loginWindow == undefined) {
        
        const activeSession = await RunUnitOfWork.run(async (unitOfWork) => {
            return await useCaseGetActiveSession.execute(unitOfWork);
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
    const useCaseLogin = UseCaseLoginProvider.get();

    loginWindow.destroy();
    loginWindow = undefined;

    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseLogin.execute(unitOfWork, loginData);
    });

    // FIXME: This should be done with an event in the event bus
    await SynchManager.execute();
    // FIXME: This should be done with an event in the event bus
    webContents.getFocusedWebContents().send('auth:logged_in');
}

async function handleLogout(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseLogout = UseCaseLogoutProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
        await useCaseLogout.execute(unitOfWork, activeSession);
    });
    
    // FIXME: This should be done with an event in the event bus
    webContents.getFocusedWebContents().send('auth:logged_out');
}

async function handleIsLoggedIn(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    return await RunUnitOfWork.run(async (unitOfWork) => {
        return await useCaseGetActiveSession.execute(unitOfWork);
    }) != undefined;
}

module.exports.AuthHandlers = {
    handleOpenLogin
    , handleLogin
    , handleLogout
    , handleIsLoggedIn
}