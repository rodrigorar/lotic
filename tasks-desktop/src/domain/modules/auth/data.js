const { Repository } = require("../../shared/ports");
const { NotImplementedError } = require("../../errors");

class AuthRepository extends Repository {

    async getByAccountId(unitOfWork, accountId) {
        throw new NotImplementedError("AuthRepository#getByAccountId is not implemented");
    }

    async getActiveSession(unitOfWork) {
        throw new NotImplementedError("AuthRepository#getActiveSession is not implemented");
    }

    async eraseForAccountId(unitOfWork, accountId) {
        throw new NotImplementedError("AuthRepository#eraseForAccountId is not implemented");
    }
}

module.exports.AuthRepository = AuthRepository;