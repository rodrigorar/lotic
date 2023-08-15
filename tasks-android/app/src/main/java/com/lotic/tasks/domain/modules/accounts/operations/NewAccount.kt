package com.lotic.tasks.domain.modules.accounts.operations

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.accounts.AccountsRepository
import com.lotic.tasks.domain.shared.Command

class NewAccount(private val accountsRepository: AccountsRepository) : Command<Account> {

    override suspend fun execute(input: Account) {
        return this.accountsRepository.insert(input)
    }

}