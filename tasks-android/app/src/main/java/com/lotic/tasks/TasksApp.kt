package com.lotic.tasks

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.lotic.tasks.ui.TasksViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.lotic.tasks.ui.MainScreen

enum class TasksScreen {
    Main
    , Login
}

@Composable
fun TasksApp(modifier: Modifier = Modifier, viewModel: TasksViewModel = viewModel()) {
    val navController = rememberNavController()
    val uiState by viewModel.uiState.collectAsState()

    NavHost(
        navController
        , startDestination = TasksScreen.Main.name) {
        composable(route = TasksScreen.Main.name) {
            MainScreen()
        }
        composable(route = TasksScreen.Login.name) {
            // TODO: Call and configure the login screen
        }
    }
}