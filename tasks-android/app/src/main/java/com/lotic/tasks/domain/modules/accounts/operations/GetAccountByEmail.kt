package com.lotic.tasks.domain.modules.accounts.operations

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.accounts.AccountsRepository
import com.lotic.tasks.domain.shared.operations.Query
import com.lotic.tasks.domain.shared.value_objects.Email

class GetAccountByEmail(
    private val accountsRepository: AccountsRepository
) : Query<Email, Account?> {

    override suspend fun execute(parameter: Email): Account? {
        return this.accountsRepository.getByEmail(parameter)
    }

}