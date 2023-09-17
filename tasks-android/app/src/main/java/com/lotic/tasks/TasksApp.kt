package com.lotic.tasks

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.lotic.tasks.ui.screens.MainScreen
import com.lotic.tasks.ui.screens.about.AboutScreen
import com.lotic.tasks.ui.screens.login.LoginScreen
import com.lotic.tasks.ui.screens.signup.SignUpScreen

enum class TasksScreen {
    Main
    , Login
    , SignUp
    , About
}

@Composable
fun TasksApp() {
    val navController = rememberNavController()

    NavHost(
        navController
        , startDestination = TasksScreen.Main.name) {

        composable(route = TasksScreen.Main.name) {
            MainScreen(
                loginNavigation = { navController.navigate(TasksScreen.Login.name) }
                , signUpNavigation = { navController.navigate(TasksScreen.SignUp.name) }
                , aboutNavigation = { navController.navigate(TasksScreen.About.name) })
        }
        composable(route = TasksScreen.Login.name) {
            LoginScreen(signInNavigation = { navController.navigate(TasksScreen.Main.name) })
        }
        composable(route = TasksScreen.SignUp.name) {
            SignUpScreen(navigationCallback = { navController.navigate(TasksScreen.Login.name)})
        }
        composable(route = TasksScreen.About.name) {
            AboutScreen()
        }
    }
}