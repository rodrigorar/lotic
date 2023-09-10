package com.lotic.tasks.ui.signup

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.accounts.dto.SignUpDTO
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password
import kotlinx.coroutines.launch

class SignUpViewModel() : ViewModel() {
    var uiState by mutableStateOf(SignUpUIState())
            private set

    fun updateUsername(newUsername: String) {
        this.uiState = this.uiState.copy(username = newUsername)
    }

    fun updatePassword(newPassword: String) {
        if (this.uiState.username != "" && newPassword == this.uiState.passwordMatch) {
            this.uiState = this.uiState.copy(password = newPassword, canSignUp = true)
        } else {
            this.uiState = this.uiState.copy(password = newPassword, canSignUp = false)
        }
    }

    fun updatePasswordMatch(newPasswordMatch: String) {
        if (this.uiState.username != "" && this.uiState.password == newPasswordMatch) {
            this.uiState = this.uiState.copy(passwordMatch = newPasswordMatch, canSignUp = true)
        } else {
            this.uiState = this.uiState.copy(passwordMatch = newPasswordMatch, canSignUp = false)
        }
    }

    fun signUp(navigationCallback: () -> Unit) {
        val signUpOperation = AccountsOperationProvider.signUp()
        viewModelScope.launch {
            signUpOperation.execute(
                SignUpDTO(
                    Email.of(uiState.username)
                    , Password.of(uiState.password))
            )
        }
        navigationCallback()
    }
}