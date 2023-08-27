package com.lotic.tasks.adapters

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.lotic.tasks.adapters.modules.accounts.persistence.DAOAccounts
import com.lotic.tasks.adapters.modules.accounts.persistence.EntityAccount
import com.lotic.tasks.adapters.modules.auth.persistence.DAOAuthToken
import com.lotic.tasks.adapters.modules.auth.persistence.EntityAuthToken
import com.lotic.tasks.adapters.modules.tasks.persistence.DAOTasks
import com.lotic.tasks.adapters.modules.tasks.persistence.DAOTasksSync
import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTask
import com.lotic.tasks.adapters.modules.tasks.persistence.EntityTasksSync
import com.lotic.tasks.domain.shared.operations.Provider

@Database(
    entities = [
        EntityAuthToken::class
        , EntityAccount::class
        , EntityTask::class
        , EntityTasksSync::class]
    , version = 6
    , exportSchema = false
)
abstract class TasksDatabase : RoomDatabase() {

    abstract fun daoAuthToken(): DAOAuthToken
    abstract fun daoAccounts(): DAOAccounts
    abstract fun daoTasks(): DAOTasks
    abstract fun daoTasksSync(): DAOTasksSync

    companion object {
        @Volatile
        private var Instance: TasksDatabase? = null

        fun getDatabase(context: Provider<Context>): TasksDatabase {
            return Instance ?: synchronized(this) {
                Room.databaseBuilder(context.get(), TasksDatabase::class.java, "tasks_database")
                    .fallbackToDestructiveMigration() // FIXME: This should not go into production
                    .build()
                    .also { Instance = it }
            }
        }

        fun getDatabase(context: Context): TasksDatabase {
            return Instance ?: synchronized(this) {
                Room.databaseBuilder(context, TasksDatabase::class.java, "tasks_database")
                    .fallbackToDestructiveMigration() // FIXME: This should not go into production
                    .build()
                    .also { Instance = it }
            }
        }
    }
}