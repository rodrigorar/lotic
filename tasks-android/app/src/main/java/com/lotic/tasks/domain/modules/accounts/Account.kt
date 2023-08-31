package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Id
import java.util.*

data class Account(val id: Id<Account>, val email: Email) {

    companion object {
        fun idOf(id: UUID): Id<Account> {
            return Id(id)
        }

        fun newId(): Id<Account> {
            return Id(UUID.randomUUID())
        }
    }
}
