package com.lotic.tasks.adapters.modules.tasks.persistence

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import org.jetbrains.annotations.NotNull
import java.util.*

@Entity(tableName = "tasks")
data class EntityTask(
    @PrimaryKey(autoGenerate = false) val id: UUID
    , @ColumnInfo(name = "title") @NotNull val title: String
    , @ColumnInfo(name = "description") @NotNull val description: String
    , @ColumnInfo(name = "created_at") @NotNull val createdAt: String
    , @ColumnInfo(name = "updated_at") @NotNull val updatedAt: String
    , @ColumnInfo(name = "owner_id") val ownerId: UUID?)
