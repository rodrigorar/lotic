package com.lotic.tasks.adapters.modules.tasks.persistence

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Title
import org.jetbrains.annotations.NotNull
import java.time.ZonedDateTime
import java.util.*

@Entity(tableName = "tasks")
data class EntityTask(
    @PrimaryKey(autoGenerate = false) val id: UUID
    , @ColumnInfo(name = "title") @NotNull val title: String
    , @ColumnInfo(name = "description") @NotNull val description: String
    , @ColumnInfo(name = "created_at") @NotNull val createdAt: String
    , @ColumnInfo(name = "updated_at") @NotNull val updatedAt: String
    , @ColumnInfo(name = "owner_id") val ownerId: UUID?) {

    companion object  {
        fun fromDomain(entity: Task): EntityTask {
            return EntityTask(
                entity.id.value
                , entity.title.value
                , entity.title.value
                , entity.createdAt.toString()
                , entity.updatedAt.toString()
                , entity.ownerId?.value)
        }
    }

    fun toDomain(): Task {
        return Task(
            Task.idOf(this.id)
            , Title.of(this.title)
            , Description.of(this.description)
            , ZonedDateTime.parse(this.createdAt)
            , ZonedDateTime.parse(this.updatedAt)
            , this.ownerId?.let { Account.idOf(it) })
    }
}
