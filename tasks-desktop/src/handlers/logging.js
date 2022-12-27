const { Logger } = require("../modules/shared/logger");

  
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

module.exports.LoggerHandler = {
  handleTraceLog,
  handleInfoLog,
  handleWarnLog,
  handleErrorLog
}