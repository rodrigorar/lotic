package com.lotic.tasks.domain.modules.accounts.operations

import com.lotic.tasks.domain.modules.accounts.dto.Account
import com.lotic.tasks.domain.modules.accounts.repositories.AccountsRepository
import com.lotic.tasks.domain.shared.Query

class GetAccountByEmail(
    private val accountsRepository: AccountsRepository) : Query<String, Account?> {

    override suspend fun execute(input: String): Account? {
        return this.accountsRepository.getByEmail(input)
    }

}