package com.lotic.tasks.adapters.modules.accounts

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.lotic.tasks.domain.modules.accounts.Account
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
            return EntityAccount(account.id, account.email)
        }
    }

    fun toDomain() : Account {
        return Account(this.id, this.email)
    }
}
