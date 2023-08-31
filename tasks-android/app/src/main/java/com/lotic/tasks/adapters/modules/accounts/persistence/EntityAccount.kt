package com.lotic.tasks.adapters.modules.accounts.persistence

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.shared.value_objects.Email
import org.jetbrains.annotations.NotNull
import java.util.*

@Entity(
    tableName = "accounts"
    , indices = [Index(value = ["email"], unique = true)]
)
data class EntityAccount(
    @PrimaryKey(autoGenerate = false) val id: UUID
    , @ColumnInfo(name = "email") @NotNull val email: String) {

    companion object {
        fun fromDomain(account: Account) : EntityAccount {
            return EntityAccount(account.id.value, account.email.value)
        }
    }

    fun toDomain() : Account {
        return Account(Account.idOf(this.id), Email(this.email))
    }
}
