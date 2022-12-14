function buildLog(event, level, message, error = undefined) {
    const result = {
      level: level,
      message: message
    }
  
    if (error) {
      result.error = error; 
    }
  
    return result;
  }
  
  function handleTraceLog(event, message) {
    const logEntry = buildLog(event, 'TRACE', message);
    console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.message}`);
  }
  
  function handleInfoLog(event, message) {
    const logEntry = buildLog(event, 'INFO', message);
    console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.message}`);
  }
  
  function handleWarnLog(event, message, error = undefined) {
    const logEntry = buildLog(event, 'WARN', message, error);
    if (! logEntry.error) {
      console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.message}`);
    } else {
      console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.error}`);
    }
  }
  
  function handleErrorLog(event, error) {
    const logEntry = buildLog(event, 'ERROR', null, error);
    console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.error}`);
  }

  module.exports.LoggerHandler = {
    handleTraceLog,
    handleInfoLog,
    handleWarnLog,
    handleErrorLog
  }