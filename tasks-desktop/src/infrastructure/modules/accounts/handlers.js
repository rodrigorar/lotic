const path = require('path');
const { webContents } = require('electron');
const { UseCaseCreateAccountProvider } = require('./providers');
const { RunUnitOfWork } = require('../../persistence/unitofwork');

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

function configure(ipcMain, mainWindow) {
    console.log(mainWindow);
    ipcMain.on('accounts:signup', (event, signUpData) => handleSignUp(event, signUpData, mainWindow));
}

module.exports.AccountsHandler = {
    configure
}