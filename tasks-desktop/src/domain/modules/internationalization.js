const { Validators } = require("../shared/utils");

class Translation {

    constructor(language, value) {
        this.language = language;
        this.value = value;
    }
}

class Language {

    constructor(name, code) {
        this.name = name;
        this.code = code;
    }
}

const UseCaseSetLanguage = (internationalizationRepository, accountsRepository) => {
    const execute = async (unitOfWork, accountId, language) => {
        Validators.isNotNull(unitOfWork, 'No unit of work provided');
        Validators.isNotNull(language, 'No language provided');

        const languageExists = await internationalizationRepository.exists(unitOfWork, language);
        if (! languageExists) {
            throw new Error('Unsupported language');
        }
        // FIXME: Use the save method after its refactored
        await accountsRepository.setLanguage(unitOfWork, accountId, language);
    }

    return {
        execute
    }
}

const UseCaseListAvailableLanguages = (internationalizationRepository) => {
    const execute = async (unitOfWork) => {
        Validators.isNotNull(unitOfWork, 'No unit of work provided');
        return await internationalizationRepository.list(unitOfWork);
    }

    return {
        execute
    }
}

const UseCaseListTranslations = (internationalizationRepository, defaultLanguage) => {
    const execute = async (unitOfWork, language) => {
        Validators.isNotNull(unitOfWork, 'No, Unit of work provided');
        Validators.isNotNull(language, 'No language provided');

        const translationExists = await internationalizationRepository.exists(unitOfWork, language);
        return await internationalizationRepository
            .getTranslations(unitOfWork, translationExists ? language : defaultLanguage);
    }

    return {
        execute
    }
}

const UseCaseGetTranslation = (internationalizationRepository) => {
    const execute = async (unitOfWork, key) => {
        Validators.isNotNull(unitOfWork, 'No unit of work provided');
        Validators.isNotNull(key, 'No key was provided');
        return await internationalizationRepository.get(unitOfWork, key);
    }

    return {
        execute
    }
}

module.exports.Translation = Translation;
module.exports.Language = Language;
module.exports.UseCaseSetLanguage = UseCaseSetLanguage;
module.exports.UseCaseListAvailableLanguages = UseCaseListAvailableLanguages;
module.exports.UseCaseListTranslations = UseCaseListTranslations;
module.exports.UseCaseGetTranslation = UseCaseGetTranslation;