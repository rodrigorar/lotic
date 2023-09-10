package com.lotic.tasks.adapters.modules.accounts.gateways.payloads

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.value_objects.Id

class NewAccountResponse(val id: String) {

    fun toDTO(): Id<Account> {
        return Account.idOf(this.id)
    }
}