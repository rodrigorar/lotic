package com.lotic.tasks.adapters.modules.auth

import com.lotic.tasks.adapters.modules.auth.persistence.DAOAuthToken
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.shared.value_objects.Id

class AuthTokenRepositoryImpl(private val daoAuthToken: DAOAuthToken) : AuthTokenRepository {

    override suspend fun insert(entity: AuthToken) {
        daoAuthToken.insert(entity.toEntity())
    }

    override suspend fun update(entity: AuthToken) {
        throw NotImplementedError("RepositoryAuthToken#update is not implemented")
    }

    override suspend fun getById(id: Int): AuthToken? {
        throw NotImplementedError("RepositoryAuthToken#getById is not implemented")
    }

    override suspend fun getByAccountId(accountId: Id<Account>): AuthToken? {
        return daoAuthToken.getByAccountId(accountId.value)?.let { AuthToken.fromEntity(it) }
    }

    override suspend fun getActiveAuthSession(): AuthToken? {
        return daoAuthToken.getActiveAuthSession()?.let { AuthToken.fromEntity(it) }
    }

    override suspend fun deleteAllForAccount(accountId: Id<Account>) {
        daoAuthToken.deleteAllForAccount(accountId.value)
    }

    override suspend fun delete(id: Int) {
        val result = daoAuthToken.getById(id)
        result?.also {
            daoAuthToken.delete(it)
        }
    }
}