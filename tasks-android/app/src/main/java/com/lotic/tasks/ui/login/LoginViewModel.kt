package com.lotic.tasks.ui.login

import android.content.Context
import android.util.Log
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.operations.Login
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel() : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUIState())
    val uiState: StateFlow<LoginUIState> = _uiState.asStateFlow()

    private var loginOperation: Login = AuthOperationsProvider.login()

    fun login(subject: String, secret: String) {
        viewModelScope.launch {
            Log.d("LoginViewModel", "Executing a login on the view model")
            loginOperation.execute(Credentials(subject, secret))
        }
    }
}