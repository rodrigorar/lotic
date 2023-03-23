package com.lotic.tasks.ui.login

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.Login
import com.lotic.tasks.domain.modules.auth.dto.Credentials
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUIState())
    val uiState: StateFlow<LoginUIState> = _uiState.asStateFlow()

    private var loginOperation: Login = Login()

    fun login(subject: String, secret: String) {
        viewModelScope.launch {
            Log.d("LoginViewModel", "Executing a login on the view model")
            loginOperation.execute(Credentials(subject, secret))
        }
    }
}