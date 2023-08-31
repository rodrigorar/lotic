package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.Repository
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

interface AuthTokenRepository : Repository<Int, AuthToken> {
    suspend fun getByAccountId(accountId: Id<Account>) : AuthToken?
    suspend fun getActiveAuthSession() : AuthToken?
    suspend fun deleteAllForAccount(accountId: Id<Account>)
}