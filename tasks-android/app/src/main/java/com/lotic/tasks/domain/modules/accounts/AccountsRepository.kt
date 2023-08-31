package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.shared.Repository
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Id

interface AccountsRepository : Repository<Id<Account>, Account> {
    suspend fun getByEmail(email: Email): Account?
}