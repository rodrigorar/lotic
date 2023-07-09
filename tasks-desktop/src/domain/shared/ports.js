const { NotImplementedException } = require('../errors');

class Repository {

    async save(unitOfWork, entityData) {
        throw new NotImplementedException("Repository#create is not implemented");
    }

    async get(unitOfWork, entityId) {
        throw new NotImplementedException("Repository#get is not implemented");
    }

    async erase(unitOfWork, entityId) {
        throw new NotImplementedException("Repository#erase is not implemented");
    }
}

class Command {

    async execute(unitOfWork, input) {
        throw new NotImplementedException("Command#execute is not implemented");
    }
}

class Query {

    async execute(unitOfWork, queryParameters) {
        throw new NotImplementedException("Query#execute is not implemented");
    }
}

module.exports.Repository = Repository;
module.exports.Command = Command;
module.exports.Query = Query;