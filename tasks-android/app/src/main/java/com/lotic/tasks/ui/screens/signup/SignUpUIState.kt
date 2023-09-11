package com.lotic.tasks.ui.screens.signup

data class SignUpUIState(
    val username: String = ""
    , val password: String = ""
    , val passwordMatch: String = ""
    , val canSignUp: Boolean = false) {
}