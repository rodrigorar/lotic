const { v4 } = require('uuid');
const { Errors } = require('../errors/errors');
const { Logger } = require('../logging/logger');

module.exports.isDev = process.env.NODE_ENV == 'development';
Logger.trace(`NODE ENV: ${process.env.NODE_ENV}`);

module.exports.generateId = () => v4();

function isNotNull(argument = undefined, message) {
    if (! argument) {
        throw new Errors.NullArgumentError(message)
    }
}

module.exports.Validators = {
    isNotNull
}