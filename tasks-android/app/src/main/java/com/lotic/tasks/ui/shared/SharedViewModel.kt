package com.lotic.tasks.ui.shared

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider

object SharedViewModel : ViewModel() {
    var uiState by mutableStateOf(SharedUIState())
        private set

    fun setLoggedIn() {
        this.uiState = this.uiState.copy(isLoggedIn = true)
    }

    fun logout() {
        AuthOperationsProvider.logout()
        this.uiState = this.uiState.copy(isLoggedIn = false)
    }
}
