const { generateId } = require("../../domain/shared/utils");

async function handleGenerateId() {
    return await generateId();
}

function configure(ipcMain) {
    ipcMain.handle('utils:id:generate', handleGenerateId);
}

module.exports.UtilsHandler = {
    configure
}