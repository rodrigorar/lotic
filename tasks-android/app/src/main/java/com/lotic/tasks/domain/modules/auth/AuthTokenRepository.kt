package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.persistence.Repository
import java.util.*

interface AuthTokenRepository : Repository<Int, AuthToken> {
    suspend fun getByAccountId(accountId: UUID) : AuthToken?
    suspend fun getActiveAuthSession() : AuthToken?
    suspend fun deleteAllForAccount(accountId: UUID)
}