const { v4 } = require('uuid');
const { Errors } = require('./errors');

module.exports.isDev = process.env.NODE_ENV !== 'production';
module.exports.generateId = () => v4();

function isNotNull(argument = undefined, message) {
    if (! argument) {
        throw new Errors.NullArgumentError(message)
    }
}

module.exports.Validators = {
    isNotNull
}