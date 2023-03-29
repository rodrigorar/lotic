package com.lotic.tasks.domain.modules.auth.repositories

import com.lotic.tasks.domain.modules.auth.data.DAOAuthToken
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.persistence.Repository
import java.util.*

class RepositoryAuthToken(private val daoAuthToken: DAOAuthToken) : Repository<Int, AuthToken> {

    override suspend fun insert(authToken: AuthToken) {
        daoAuthToken.insert(authToken.toEntity())
    }

    override suspend fun update(id: Int, authToken: AuthToken) {
        throw NotImplementedError("RepositoryAuthToken#update is not implemented")
    }

    override suspend fun getById(id: Int): AuthToken? {
        throw NotImplementedError("RepositoryAuthToken#getById is not implemented")
    }

    suspend fun getByAccountId(accountId: UUID): AuthToken? {
        return daoAuthToken.getByAccountId(accountId).let { result ->
            result?.let { AuthToken.fromEntity(it) }
        }
    }

    suspend fun deleteAllForAccount(accountId: UUID) {
        daoAuthToken.deleteAllForAccount(accountId)
    }

    override suspend fun delete(id: Int) {
        val result = daoAuthToken.getById(id)
        result?.also {
            daoAuthToken.delete(it)
        }
    }

}