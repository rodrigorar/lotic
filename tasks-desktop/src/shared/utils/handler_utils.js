const { generateId } = require('../../domain/shared/utils');

async function handleGenerateId() {
    return await generateId();
}

module.exports.UtilsHandler = {
    handleGenerateId
}