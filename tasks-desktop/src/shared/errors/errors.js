
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

class UnknownAccountError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnknownAccountError';
    }
}

class LoginFailedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LoginFailedError';
    }
}

module.exports.Errors = {
    InvalidArgumentError
    , NullArgumentError
    , UnknownAccountError
    , LoginFailedError
}