package com.lotic.tasks.domain.modules.accounts.dto

import com.lotic.tasks.domain.modules.accounts.data.EntityAccount
import com.lotic.tasks.domain.shared.FromEntity
import com.lotic.tasks.domain.shared.ToEntity
import java.util.*

data class Account(val id: UUID, val email: String) : ToEntity<EntityAccount> {

    companion object : FromEntity<Account, EntityAccount> {

        override fun fromEntity(entity: EntityAccount): Account {
            return Account(entity.id, entity.email)
        }

    }

    override fun toEntity(): EntityAccount {
        return EntityAccount(this.id, this.email)
    }

}
