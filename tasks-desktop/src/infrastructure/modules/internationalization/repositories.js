const { Translation, Language } = require("../../../domain/modules/internationalization");
const { Tables, Fields } = require("../../persistence/tables");

const InternationalizationRepository = (() => {

    const exists = async (unitOfWork, language) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.all(
            `SELECT * FROM ${Tables.I18N} WHERE ${Fields.I18N.Language}=?`
            , [language]
        );
        return result.length > 0;
    }

    const get = async (unitOfWork, key, language) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.get(
            `SELECT * FROM ${Tables.I18N} `
            + `WHERE ${Fields.I18N.Key}=? AND ${Fields.I18N.Language}=?`
            , [key, language]
        );
        return new Translation(result.language, result.value);
    }

    const getTranslations = async (unitOfWork, language) => {
        const queryManager = unitOfWork.getQueryManager();
        const queryResult = await queryManager.all(
            `SELECT * FROM ${Tables.I18N} `
            + `WHERE ${Fields.I18N.Language}=?`
            , [language]
        );
        const result = {};
        for (const entry of queryResult) {
            result[entry.key] = entry.value;
        }
        return result;
    }

    const listAvailableLanguages = async (unitOfWork) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.all(
            `SELECT * FROM ${Tables.I18NLanguages} `
            , []
        );
        return result.map((entry) => new Language(entry.name, entry.code));
    }

    return {
        exists
        , get
        , getTranslations
        , listAvailableLanguages
    }
})();

module.exports.InternationalizationRepository = InternationalizationRepository;