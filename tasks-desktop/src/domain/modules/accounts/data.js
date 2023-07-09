const { NotImplementedError } = require('../../errors');
const { Repository } = require('../../shared/ports');

class AccountsRepository extends Repository {

    async getByEmail(unitOfWork, email) {
        throw new NotImplementedError("AccountsRepository#getByEmail is not implemented");
    }
}

module.exports.AccountsRepository = AccountsRepository;