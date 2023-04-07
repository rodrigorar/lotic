package com.lotic.tasks.ui.login

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.operations.Login
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.ui.shared.SharedViewModel
import kotlinx.coroutines.launch

class LoginViewModel() : ViewModel() {
    val sharedViewModel: SharedViewModel = SharedViewModel
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
            loginOperation.execute(Credentials(subject, secret))
            sharedViewModel.refresh()
        }
    }
}