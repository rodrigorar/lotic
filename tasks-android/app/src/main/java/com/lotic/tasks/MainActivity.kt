package com.lotic.tasks

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.shared.Provider
import com.lotic.tasks.ui.theme.TasksTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val contextProvider = Provider<Context> { this }
        val accountsOperationsProvider = AccountsOperationProvider
            .setContextProvider(contextProvider)
            .init()
        AuthOperationsProvider
            .setContextProvider(contextProvider)
            .setAccountOperationsProvider(accountsOperationsProvider)
            .init()

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