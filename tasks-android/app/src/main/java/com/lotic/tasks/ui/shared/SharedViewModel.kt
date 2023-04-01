package com.lotic.tasks.ui.shared

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import kotlinx.coroutines.launch

object SharedViewModel : ViewModel() {
    var uiState by mutableStateOf(SharedUIState())
        private set

    init {
        viewModelScope.launch {
            val authToken: AuthToken? = AuthOperationsProvider.currentActiveAuthSessionProvider().get()
            uiState = uiState.copy(isLoggedIn = authToken != null)
        }
    }

    fun setLoggedIn() {
        this.uiState = this.uiState.copy(isLoggedIn = true)
    }

    fun logout() {
        AuthOperationsProvider.logout()
        this.uiState = this.uiState.copy(isLoggedIn = false)
    }
}
