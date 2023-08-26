package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.shared.Repository
import java.util.*

interface AccountsRepository : Repository<UUID, Account> {
    suspend fun getByEmail(email: String): Account?
}