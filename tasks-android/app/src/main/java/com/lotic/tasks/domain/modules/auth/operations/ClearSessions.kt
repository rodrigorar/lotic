package com.lotic.tasks.domain.modules.auth.operations

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.value_objects.Id

class ClearSessions(
    private val authTokenRepository: AuthTokenRepository
) : Command<Id<Account>> {

    override suspend fun execute(input: Id<Account>) {
        authTokenRepository.deleteAllForAccount(input)
    }

}