const path = require('path');
const { webContents } = require('electron');
const { UseCaseCreateAccountProvider, UseCaseGetAccountProvider } = require('./providers');
const { RunUnitOfWork } = require('../../persistence/unitofwork');
const { UseCaseGetActiveSessionProvider } = require('../auth/providers');

async function handleSignUp(event, signUpData, mainWindow) {
    RunUnitOfWork.run(async (unitOfWork) => {
        const useCaseCreateLocalAccount = UseCaseCreateAccountProvider.get();
        await useCaseCreateLocalAccount.execute(unitOfWork, signUpData);
    
        mainWindow.loadFile(path.join(__dirname, '../../../ui/signin/signin.html'));
    
        setTimeout(() => {
          webContents.getFocusedWebContents().send('accounts:signup_success', {
            message: "Account Created, Please Log In"
          });
        }, 250);
      });
}

async function handleGetAccount(event) {
  const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
  const useCaseGetAccount = UseCaseGetAccountProvider.get();

  return await RunUnitOfWork.run(async (unitOfWork) => {
    const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
    let account = null;
    if (activeSession) {
      account = await useCaseGetAccount.execute(unitOfWork, activeSession.accountId);
    }
    return account;
  });
}

function configure(ipcMain, mainWindow) {
    ipcMain.on('accounts:signup', (event, signUpData) => handleSignUp(event, signUpData, mainWindow));
    ipcMain.handle('accounts:get', handleGetAccount);
}

module.exports.AccountsHandler = {
    configure
}