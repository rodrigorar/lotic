package com.lotic.tasks.domain.persistence

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.lotic.tasks.domain.modules.accounts.data.DAOAccounts
import com.lotic.tasks.domain.modules.accounts.data.EntityAccount
import com.lotic.tasks.domain.modules.auth.data.DAOAuthToken
import com.lotic.tasks.domain.modules.auth.data.EntityAuthToken
import com.lotic.tasks.domain.modules.tasks.data.DAOTasks
import com.lotic.tasks.domain.modules.tasks.data.DAOTasksSync
import com.lotic.tasks.domain.modules.tasks.data.EntityTask
import com.lotic.tasks.domain.modules.tasks.data.EntityTasksSync

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