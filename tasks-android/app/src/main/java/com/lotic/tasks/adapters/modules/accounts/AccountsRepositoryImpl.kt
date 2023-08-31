package com.lotic.tasks.adapters.modules.accounts

import com.lotic.tasks.adapters.modules.accounts.persistence.DAOAccounts
import com.lotic.tasks.adapters.modules.accounts.persistence.EntityAccount
import com.lotic.tasks.domain.modules.accounts.AccountsRepository
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Id


class AccountsRepositoryImpl(private val accountsDAO: DAOAccounts) : AccountsRepository {

    override suspend fun insert(entity: Account) {
        this.accountsDAO.insert(EntityAccount.fromDomain(entity));
    }

    override suspend fun update(entity: Account) {
        this.accountsDAO.update(EntityAccount.fromDomain(entity));
    }

    override suspend fun getById(id: Id<Account>): Account? {
        val accountEntity: EntityAccount? = this.accountsDAO.getById(id.value);
        return accountEntity?.toDomain();
    }

    override suspend fun getByEmail(email: Email): Account? {
        val accountEntity: EntityAccount? = this.accountsDAO.getByEmail(email.value);
        return accountEntity?.toDomain();
    }

    override suspend fun delete(id: Id<Account>) {
        val entityAccount: EntityAccount? = this.accountsDAO.getById(id.value);
        entityAccount?.let {
            this.accountsDAO.delete(it);
        }
    }


}