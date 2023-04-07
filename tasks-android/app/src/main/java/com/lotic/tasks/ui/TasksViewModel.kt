package com.lotic.tasks.ui

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventObserver
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.auth.dto.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import kotlinx.coroutines.launch
import java.util.*

// TODO: Remove the list
data class TasksUIState(
    val taskList: List<Task> = listOf()
    , val isLoggedIn: Boolean) {
    // Do nothing for now
}

class TasksViewModel : ViewModel(), EventObserver {
    var uiState by mutableStateOf(TasksUIState(isLoggedIn = false))
        private set

    init {
        EventBus.subscribe(EventType.SYNC_SUCCESS, this)
        EventBus.subscribe(EventType.LOGIN_SUCCESS, this)
        EventBus.subscribe(EventType.LOGOUT_SUCCESS, this)

        viewModelScope.launch {
            verifyIfLoggedIn()
            refreshTaskList()
        }
    }

    fun logout() {
        viewModelScope.launch {
            val currentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()
            currentActiveAuthSessionProvider.get()?.let {
                TasksOperationsProvider.clearTasksForAccount().execute(it.accountId)
            }
            AuthOperationsProvider.logout().execute()
        }
    }

    fun markComplete(id: UUID) {
        Log.d("TasksViewModel", "Mark Complete called, do nothing")
    }

    private suspend fun verifyIfLoggedIn() {
        val authToken: AuthToken? = AuthOperationsProvider.currentActiveAuthSessionProvider().get()
        uiState = uiState.copy(isLoggedIn = authToken != null)
    }

    private suspend fun refreshTaskList() {
        uiState = uiState.copy(taskList = TasksOperationsProvider.listTasks().get())
    }

    override fun notify(event: Event) {
        if (event.isOfType(EventType.SYNC_SUCCESS)) {
            viewModelScope.launch {
                refreshTaskList()
            }
        } else if (event.isOfType(EventType.LOGIN_SUCCESS)) {
            this.uiState = this.uiState.copy(isLoggedIn = true)
        } else if (event.isOfType(EventType.LOGOUT_SUCCESS)) {
            this.uiState = this.uiState.copy(isLoggedIn = false)
            viewModelScope.launch {
                refreshTaskList()
            }
        }
    }
}