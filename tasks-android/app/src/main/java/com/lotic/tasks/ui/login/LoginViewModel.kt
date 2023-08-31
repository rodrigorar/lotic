package com.lotic.tasks.ui.login

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.operations.Login
import com.lotic.tasks.domain.modules.auth.Credentials
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password
import kotlinx.coroutines.launch

class LoginViewModel() : ViewModel() {
    var uiState by mutableStateOf(LoginUIState())
        private set

    private var loginOperation: Login = AuthOperationsProvider.login()

    fun updateSubject(newSubject: String) {
        this.uiState = this.uiState.copy(subject = newSubject)
    }

    fun updateSecret(newSecret: String) {
        this.uiState = this.uiState.copy(secret = newSecret)
    }

    // TODO: Move this to the shared view model
    fun login(subject: String, secret: String) {
        viewModelScope.launch {
            loginOperation.execute(Credentials(Email.of(subject), Password.of(secret)))
        }
    }
}