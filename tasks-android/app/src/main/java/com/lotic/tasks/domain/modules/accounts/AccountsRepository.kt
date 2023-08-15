package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.persistence.Repository
import java.util.*

interface AccountsRepository : Repository<UUID, Account> {
    suspend fun getByEmail(email: String): Account?
}