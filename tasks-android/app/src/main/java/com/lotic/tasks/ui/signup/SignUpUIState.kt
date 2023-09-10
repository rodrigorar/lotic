package com.lotic.tasks.ui.signup

data class SignUpUIState(
    val username: String = ""
    , val password: String = ""
    , val passwordMatch: String = ""
    , val canSignUp: Boolean = false) {
}