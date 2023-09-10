package com.lotic.tasks.domain.modules.accounts.operations

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.accounts.AccountsRepository
import com.lotic.tasks.domain.modules.accounts.dto.SignUpDTO
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.operations.Operation
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Id

class SignUp(
    private val accountsRepository: AccountsRepository
    , private val validateEmail: Operation<Email, Boolean>
    , private val signUpGateway: Gateway<SignUpDTO, Id<Account>?>) : Command<SignUpDTO> {

    override suspend fun execute(input: SignUpDTO) {
        if (! this.validateEmail.execute(input.username)) {
            throw IllegalArgumentException("Invalid email")
        }

        val accountId = this.signUpGateway.call(input)
        accountId?.let {
            this.accountsRepository.insert(Account(it, input.username))
        }
    }

}