package com.lotic.tasks

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.tasks.SyncManager
import com.lotic.tasks.domain.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.shared.Provider
import com.lotic.tasks.ui.theme.TasksTheme
import java.time.Duration
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val contextProvider = Provider<Context> { this }
        val accountsOperationsProvider = AccountsOperationProvider
            .setContextProvider(contextProvider)
            .init()
        val authOperationsProvider = AuthOperationsProvider
            .setContextProvider(contextProvider)
            .setAccountOperationsProvider(accountsOperationsProvider)
            .init()
        TasksOperationsProvider
            .setContextProvider(contextProvider)
            .setAuthOperationsProvider(authOperationsProvider)
            .init()

        WorkManager
            .getInstance(this)
            .enqueueUniquePeriodicWork(
                "synch-manager"
                , ExistingPeriodicWorkPolicy.REPLACE
                , PeriodicWorkRequestBuilder<SyncManager>(1L, TimeUnit.SECONDS)
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