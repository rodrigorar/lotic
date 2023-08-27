package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.adapters.modules.accounts.persistence.EntityAccount
import com.lotic.tasks.domain.shared.mappers.FromEntity
import com.lotic.tasks.domain.shared.mappers.ToEntity
import java.util.*

data class Account(val id: UUID, val email: String) : ToEntity<EntityAccount> {

    companion object : FromEntity<Account, EntityAccount> {

        // FIXME: Move this to the Persistence Entity (EntityAccount)
        override fun fromEntity(entity: EntityAccount): Account {
            return Account(entity.id, entity.email)
        }

    }

    // FIXME: Move this to the Persistence Entity (EntityAccount)
    override fun toEntity(): EntityAccount {
        return EntityAccount(this.id, this.email)
    }

}
