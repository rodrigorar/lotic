const { AppConfig } = require("../../configs");
const { RunUnitOfWork } = require("../../persistence/unitofwork");
const { UseCaseGetAccountProvider } = require("../accounts/providers");
const { UseCaseGetActiveSessionProvider } = require("../auth/providers");
const { UseCaseListTranslationsProvider, UseCaseSetLanguageProvider } = require("./providers");


async function handleGetTranslations(event) {
    const useCaseListTranslations = UseCaseListTranslationsProvider.get();
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseGetAccount = UseCaseGetAccountProvider.get();
    return await RunUnitOfWork.run(async (unitOfWork) => {
        const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
        let language = AppConfig.defaultLanguage;
        if (activeSession) {
            const account = await useCaseGetAccount.execute(unitOfWork, activeSession.accountId);
            language = account.language;
        }
        return await useCaseListTranslations.execute(unitOfWork, language);
    });
}

async function handleGetLanguage(event) {
    const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
    const useCaseGetAccount = UseCaseGetAccountProvider.get();
  
    return await RunUnitOfWork.run(async (unitOfWork) => {
      const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
      if (activeSession) {
        account = await useCaseGetAccount.execute(unitOfWork, activeSession.accountId);
        if (account) {
          return account.language;
        } else {
          return AppConfig.defaultLanguage;
        }
      } else {
        return AppConfig.defaultLanguage;
      }
    });
}

async function handleSetLanguage(event, language) {
  const useCaseGetActiveSession = UseCaseGetActiveSessionProvider.get();
  const useCaseSetLanguage = UseCaseSetLanguageProvider.get();
  await RunUnitOfWork.run(async (unitOfWork) => {
    const activeSession = await useCaseGetActiveSession.execute(unitOfWork);
    if (activeSession) {
      await useCaseSetLanguage.execute(unitOfWork, activeSession.accountId, language);
    }
  });
}

function configure(ipcMain) {
    ipcMain.handle('i18n:translations:get', handleGetTranslations);
    ipcMain.handle('i18n:language:get', handleGetLanguage);
    ipcMain.on('i18n:language:set', handleSetLanguage);
}

module.exports.InternationalizationHandler = {
    configure
}