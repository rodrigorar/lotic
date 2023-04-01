package com.lotic.tasks.domain.modules.accounts.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import org.jetbrains.annotations.NotNull
import java.util.*

@Entity(
    tableName = "accounts"
    , indices = [Index(value = ["email"], unique = true)]
)
data class EntityAccount(
    @PrimaryKey(autoGenerate = false) val id: UUID
    , @ColumnInfo(name = "email") @NotNull val email: String)
