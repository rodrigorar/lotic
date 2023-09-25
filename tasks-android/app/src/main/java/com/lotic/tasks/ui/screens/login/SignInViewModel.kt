package com.lotic.tasks.ui.screens.login

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.operations.SignIn
import com.lotic.tasks.domain.modules.auth.Credentials
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password
import kotlinx.coroutines.launch

class SignInViewModel() : ViewModel() {
    var uiState by mutableStateOf(SignInUIState())
        private set

    private var loginOperation: SignIn = AuthOperationsProvider.login()

    fun updateCanSignIn() {
        if (this.uiState.subject != "" && this.uiState.secret != "") {
            this.uiState = this.uiState.copy(canSignIn = true)
        } else {
            this.uiState = this.uiState.copy(canSignIn = false)
        }
    }

    fun updateSubject(newSubject: String) {
        this.uiState = this.uiState.copy(subject = newSubject)
        updateCanSignIn()
    }

    fun updateSecret(newSecret: String) {
        this.uiState = this.uiState.copy(secret = newSecret)
        updateCanSignIn()
    }

    fun login(subject: String, secret: String) {
        viewModelScope.launch {
            loginOperation.execute(Credentials(Email.of(subject), Password.of(secret)))
        }
    }
}