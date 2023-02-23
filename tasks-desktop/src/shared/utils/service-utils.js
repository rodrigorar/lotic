const { Logger } = require("../logging/logger");

function errorWrapper(service) {
    try {
        return service()
    } catch (err) {
        Logger.error(err);
    }
}

async function asyncErrorWrapper(service) {
    try {
        return await service()
    } catch (err) {
        Logger.error(err);
    }
}

module.exports.ServiceUtils = {
    errorWrapper,
    asyncErrorWrapper
}