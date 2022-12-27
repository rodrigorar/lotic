function buildLog(level, message, error = undefined) {
    const result = {
      level: level,
      message: message
    }
  
    if (error) {
      result.error = error; 
    }
  
    return result;
  }
  
  function trace(message) {
    const logEntry = buildLog('TRACE', message);
    console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.message}`);
  }
  
  function info(message) {
    const logEntry = buildLog('INFO', message);
    console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.message}`);
  }
  
  function warn(message, error = undefined) {
    const logEntry = buildLog('WARN', message, error);
    if (! logEntry.error) {
      console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.message}`);
    } else {
      console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.error}`);
    }
  }
  
  function error(error) {
    const logEntry = buildLog('ERROR', null, error);
    console.log(`${new Date().toISOString()} - ${logEntry.level}: ${logEntry.error}`);
  }
  
  module.exports.Logger = {
    trace,
    info,
    warn,
    error
  }