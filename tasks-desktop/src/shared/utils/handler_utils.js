const { generateId } = require('./utils');

async function handleGenerateId() {
    return await generateId();
}

module.exports.UtilsHandler = {
    handleGenerateId
}