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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.*

object SharedViewModel : ViewModel() {
    var uiState by mutableStateOf(SharedUIState(isLoggedIn = false))
        private set

    init {
        viewModelScope.launch {
            val authToken: AuthToken? = AuthOperationsProvider.currentActiveAuthSessionProvider().get()
            Log.d("SharedViewModel", "Are we logged in?")
            authToken?.also { Log.d("SharedViewModel", it.token) }
            val taskList = TasksOperationsProvider.listTasks().get()
            uiState = uiState.copy(isLoggedIn = authToken != null, taskList = taskList)
        }
    }

    fun logout() {
        viewModelScope.launch {
            val currentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()
            currentActiveAuthSessionProvider.get()?.let {
                Log.d("SharedViewModel", "Logging out")
                TasksOperationsProvider.clearTasksForAccount().execute(it.accountId)
            }
            AuthOperationsProvider.logout().execute()
            val taskList = TasksOperationsProvider.listTasks().get()
            uiState = uiState.copy(isLoggedIn = false, taskList = taskList)
        }
    }

    fun refresh() {
        viewModelScope.launch {
            val authToken: AuthToken? = AuthOperationsProvider.currentActiveAuthSessionProvider().get()
            Log.d("SharedViewModel", "Are we logged in?")
            authToken?.also { Log.d("SharedViewModel", it.token) }
            val taskList = TasksOperationsProvider.listTasks().get()
            uiState = uiState.copy(isLoggedIn = authToken != null, taskList = taskList)
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
