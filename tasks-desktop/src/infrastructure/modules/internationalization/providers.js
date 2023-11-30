const { UseCaseSetLanguage, UseCaseListAvailableLanguages, UseCaseListTranslations, UseCaseGetTranslations } = require("../../../domain/modules/internationalization");
const { AccountRepository } = require("../accounts/repositories");
const { InternationalizationRepository } = require("./repositories");
const { AppConfig } = require('../../configs');

const UseCaseSetLanguageProvider = (() => {
    const get = () => UseCaseSetLanguage(InternationalizationRepository, AccountRepository);
    return {
        get
    }
})();

const UseCaseListAvailableLanguagesProvider = (() => {
    const get = () => UseCaseListAvailableLanguages(InternationalizationRepository);
    return {
        get
    }
})();

const UseCaseListTranslationsProvider = (() => {
    const get = () => UseCaseListTranslations(InternationalizationRepository, AppConfig.defaultLanguage);
    return {
        get
    }
})();

const UseCaseGetTranslationsProvider = (() => {
    const get = () => UseCaseGetTranslations(InternationalizationRepository);
    return {
        get
    }
})();

module.exports.UseCaseSetLanguageProvider = UseCaseSetLanguageProvider;
module.exports.UseCaseListAvailableLanguagesProvider = UseCaseListAvailableLanguagesProvider;
module.exports.UseCaseListTranslationsProvider = UseCaseListTranslationsProvider;
module.exports.UseCaseGetTranslationsProvider = UseCaseGetTranslationsProvider;