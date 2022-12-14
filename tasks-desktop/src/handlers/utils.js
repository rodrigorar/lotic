const { generateId } = require('../modules/shared/utils');

async function handleGenerateId() {
    return await generateId();
}

module.exports.UtilsHandler = {
    handleGenerateId
}