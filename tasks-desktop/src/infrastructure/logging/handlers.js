const { Logger } = require("../../domain/shared/logger");

  
function handleTraceLog(event, message) {
  Logger.trace(message);
}

function handleInfoLog(event, message) {
  Logger.info(message);
}

function handleWarnLog(event, message, error = undefined) {
  Logger.warn(message, error);
}

function handleErrorLog(event, error) {
  Logger.error(error);
}

function configure(ipcMain) {
  ipcMain.on('log:trace', handleTraceLog);
  ipcMain.on('log:info', handleInfoLog);
  ipcMain.on('log:warn', handleWarnLog);
  ipcMain.on('log:error', handleErrorLog);
}

module.exports.LoggerHandler = {
  configure
}