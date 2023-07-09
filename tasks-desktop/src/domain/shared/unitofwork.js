
class UnitOfWork {
    async init() {
        throw new NotImplementedError("UnitOfWork#init is not implemented");
    }

    async begin() {
        throw new NotImplementedError("UnitOfWork#begin is not implemented");
    }

    getQueryManager() {
        throw new NotImplementedError("UnitOfWork#getQueryManager is not implemented");
    }

    async commit() {
        throw new NotImplementedError("UnitOfWork#commit is not implemented");
    }

    async rollback() {
        throw new NotImplementedError("UnitOfWork#rollback is not implemented");
    }
}

module.exports.UnitOfWork = UnitOfWork;