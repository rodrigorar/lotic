package com.lotic.tasks.ui.shared

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.*

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

    fun getTaskList() {
        viewModelScope.launch {
            val listTaskOperations = TasksOperationsProvider.listTasks()
            uiState = uiState.copy(taskList = listTaskOperations.get())
        }
    }

    fun markComplete(id: UUID) {
        viewModelScope.launch {
            delay(500)
            Log.d("SharedViewModel", "Executing a mark complete")
            // TODO: Remove task from database
            // FIXME: Remove the UI removal and replace by a proper service
        }
    }
}
