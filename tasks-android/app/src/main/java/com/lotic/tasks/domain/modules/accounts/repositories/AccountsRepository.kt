package com.lotic.tasks.domain.modules.accounts.repositories

import com.lotic.tasks.domain.modules.accounts.data.DAOAccounts
import com.lotic.tasks.domain.modules.accounts.data.EntityAccount
import com.lotic.tasks.domain.modules.accounts.dto.Account
import com.lotic.tasks.domain.persistence.Repository
import java.util.*

class AccountsRepository(private val daoAccounts: DAOAccounts) : Repository<UUID, Account> {

    override suspend fun insert(entity: Account) {
        this.daoAccounts.insert(entity.toEntity())
    }

    override suspend fun update(id: UUID, entity: Account) {
        throw NotImplementedError("AccountsRepository#update is not implemented")
    }

    override suspend fun getById(id: UUID): Account? {
        throw NotImplementedError("AccountsRepository#getById is not implemented")
    }

    suspend fun getByEmail(email: String): Account? {
        val result: EntityAccount? = this.daoAccounts.getByEmail(email)
        return result?.let {
            Account(it.id, it.email)
        }
    }

    override suspend fun delete(id: UUID) {
        throw NotImplementedError("AccountsRepository#delete is not implemented")
    }
}