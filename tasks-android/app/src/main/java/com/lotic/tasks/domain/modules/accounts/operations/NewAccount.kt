package com.lotic.tasks.domain.modules.accounts.operations

import com.lotic.tasks.domain.modules.accounts.dto.Account
import com.lotic.tasks.domain.modules.accounts.repositories.AccountsRepository
import com.lotic.tasks.domain.shared.Command

class NewAccount(private val accountsRepository: AccountsRepository) : Command<Account> {

    override suspend fun execute(input: Account) {
        // TODO: Add a validation to the input, making sure is not null, etc
        return this.accountsRepository.insert(input)
    }

}