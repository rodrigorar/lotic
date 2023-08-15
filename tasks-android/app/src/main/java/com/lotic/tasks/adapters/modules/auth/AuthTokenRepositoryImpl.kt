package com.lotic.tasks.adapters.modules.auth

import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.AuthToken
import java.util.*

class AuthTokenRepositoryImpl(private val daoAuthToken: DAOAuthToken) : AuthTokenRepository {

    override suspend fun insert(authToken: AuthToken) {
        daoAuthToken.insert(authToken.toEntity())
    }

    override suspend fun update(id: Int, authToken: AuthToken) {
        throw NotImplementedError("RepositoryAuthToken#update is not implemented")
    }

    override suspend fun getById(id: Int): AuthToken? {
        throw NotImplementedError("RepositoryAuthToken#getById is not implemented")
    }

    override suspend fun getByAccountId(accountId: UUID): AuthToken? {
        return daoAuthToken.getByAccountId(accountId)?.let { AuthToken.fromEntity(it) }
    }

    override suspend fun getActiveAuthSession(): AuthToken? {
        return daoAuthToken.getActiveAuthSession()?.let { AuthToken.fromEntity(it) }
    }

    override suspend fun deleteAllForAccount(accountId: UUID) {
        daoAuthToken.deleteAllForAccount(accountId)
    }

    override suspend fun delete(id: Int) {
        val result = daoAuthToken.getById(id)
        result?.also {
            daoAuthToken.delete(it)
        }
    }
}