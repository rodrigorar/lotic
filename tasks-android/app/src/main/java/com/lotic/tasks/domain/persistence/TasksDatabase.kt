package com.lotic.tasks.domain.persistence

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.lotic.tasks.domain.modules.auth.data.DAOAuthToken
import com.lotic.tasks.domain.modules.auth.data.EntityAuthToken

@Database(entities = [EntityAuthToken::class], version = 1, exportSchema = false)
abstract class TasksDatabase : RoomDatabase() {

    abstract fun daoAuthToken(): DAOAuthToken

    companion object {
        @Volatile
        private var Instance: TasksDatabase? = null

        fun getDatabase(context: Context): TasksDatabase {
            return Instance ?: synchronized(this) {
                Room.databaseBuilder(context, TasksDatabase::class.java, "tasks_database")
                    .build()
                    .also { Instance = it }
            }
        }
    }
}