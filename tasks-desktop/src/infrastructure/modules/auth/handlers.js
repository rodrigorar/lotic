const { webContents } = require('electron');
const { UseCaseSignInProvider, UseCaseGetActiveSessionProvider, UseCaseSignOutProvider } = require('./providers');
const { UseCaseDeleteAllTasksForAccountProvider, UseCaseDeleteAllTaskSyncsForAccountProvider } = require('../tasks/providers');
const { RunUnitOfWork } = require('../../persistence/unitofwork');

async function handleSignIn(event, signInData) {
    const useCaseSignIn = UseCaseSignInProvider.get();
    await RunUnitOfWork.run(async (unitOfWork) => {
        await useCaseSignIn.execute(unitOfWork, signInData);
    });
}

async function handleSignOut(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseDeleteAllTasksForAccount = UseCaseDeleteAllTasksForAccountProvider.get();
    const useCaseDeleteAllTaskSyncsForAccount = UseCaseDeleteAllTaskSyncsForAccountProvider.get();
    const useCaseSignOut = UseCaseSignOutProvider.get();

    await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
        
        await useCaseDeleteAllTaskSyncsForAccount.execute(unitOfWork, activeSession.accountId);
        await useCaseDeleteAllTasksForAccount.execute(unitOfWork, activeSession.accountId);

        await useCaseSignOut.execute(unitOfWork, activeSession);
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

function configure(ipcMain) {
    ipcMain.on('auth:signin', handleSignIn);
    ipcMain.on('auth:logout', handleSignOut);
    ipcMain.handle('auth:is_logged_in', handleIsLoggedIn);
}

module.exports.AuthHandler = {
    configure
}