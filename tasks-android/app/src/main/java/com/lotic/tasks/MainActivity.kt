package com.lotic.tasks

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.lotic.tasks.adapters.modules.accounts.AccountsRepositoryImpl
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.domain.modules.tasks.SyncManagerWorker
import com.lotic.tasks.adapters.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.adapters.modules.tasks.TasksSyncOperationsProvider
import com.lotic.tasks.adapters.TasksDatabase
import com.lotic.tasks.adapters.modules.auth.AuthTokenRepositoryImpl
import com.lotic.tasks.adapters.modules.auth.events.LoginSuccessPublisher
import com.lotic.tasks.adapters.modules.tasks.TasksRepositoryImpl
import com.lotic.tasks.adapters.modules.tasks.TasksSyncRepositoryImpl
import com.lotic.tasks.domain.shared.operations.Provider
import com.lotic.tasks.ui.theme.TasksTheme
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val contextProvider = Provider<Context> { this }

        val accountsOperationsProvider = AccountsOperationProvider
            .setContextProvider(contextProvider)
            .init(
                AccountsRepositoryImpl(
                    TasksDatabase.getDatabase(contextProvider).daoAccounts()
                )
            )

        val authOperationsProvider = AuthOperationsProvider
            .setContextProvider(contextProvider)
            .setAccountOperationsProvider(accountsOperationsProvider)
            .init(
                AuthTokenRepositoryImpl(
                    TasksDatabase.getDatabase(contextProvider).daoAuthToken()
                )
            )

        TasksOperationsProvider
            .setContextProvider(contextProvider)
            .setAuthOperationsProvider(authOperationsProvider = authOperationsProvider)
            .init(
                TasksRepositoryImpl(
                    TasksDatabase.getDatabase(contextProvider).daoTasks()
                )
            )

        TasksSyncOperationsProvider
            .setContextProvider(contextProvider)
            .init(
                TasksSyncRepositoryImpl(
                    TasksDatabase.getDatabase(contextProvider).daoTasksSync()
                )
                , LoginSuccessPublisher
            )

        WorkManager
            .getInstance(this)
            .enqueueUniquePeriodicWork(
                "synch-manager"
                , ExistingPeriodicWorkPolicy.REPLACE
                , PeriodicWorkRequestBuilder<SyncManagerWorker>(15L, TimeUnit.SECONDS)
                    .addTag("tasks-synch-manager-tag")
                    /*.setConstraints(
                        Constraints.Builder()
                            .setRequiredNetworkType(NetworkType.CONNECTED)
                            .build())*/
                    .build())

        setContent {
            TasksTheme {
                TasksApp()
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    TasksTheme {
        TasksApp()
    }
}