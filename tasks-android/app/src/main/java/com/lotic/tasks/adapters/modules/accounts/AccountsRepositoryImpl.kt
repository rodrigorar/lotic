package com.lotic.tasks.adapters.modules.accounts

import com.lotic.tasks.domain.modules.accounts.AccountsRepository
import com.lotic.tasks.domain.modules.accounts.Account
import java.util.*


class AccountsRepositoryImpl(private val accountsDAO: DAOAccounts) : AccountsRepository {

    override suspend fun insert(entity: Account) {
        this.accountsDAO.insert(EntityAccount.fromDomain(entity));
    }

    override suspend fun update(id: UUID, entity: Account) {
        this.accountsDAO.update(EntityAccount.fromDomain(entity));
    }

    override suspend fun getById(id: UUID): Account? {
        val accountEntity: EntityAccount? = this.accountsDAO.getById(id);
        return accountEntity?.toDomain();
    }

    override suspend fun getByEmail(email: String): Account? {
        val accountEntity: EntityAccount? = this.accountsDAO.getByEmail(email);
        return accountEntity?.toDomain();
    }

    override suspend fun delete(id: UUID) {
        val entityAccount: EntityAccount? = this.accountsDAO.getById(id);
        entityAccount?.let {
            this.accountsDAO.delete(it);
        }
    }


}