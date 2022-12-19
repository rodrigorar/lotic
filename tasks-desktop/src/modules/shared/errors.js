
class InvalidArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidArgumentError';
    }
}

class NullArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NullArgumentError';
    }
}

module.exports.Errors = {
    InvalidArgumentError,
    NullArgumentError
}