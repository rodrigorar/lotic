package com.lotic.tasks.ui.shared

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

object SharedViewModel : ViewModel() {
    var uiState by mutableStateOf(SharedUIState())
        private set

    fun setLoggedIn() {
        this.uiState = this.uiState.copy(isLoggedIn = true)
    }

    fun setLoggedOut() {
        this.uiState = this.uiState.copy(isLoggedIn = false)
    }
}
