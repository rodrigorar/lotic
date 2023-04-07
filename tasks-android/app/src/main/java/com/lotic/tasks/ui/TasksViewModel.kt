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
import com.lotic.tasks.domain.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import kotlinx.coroutines.launch

// TODO: Remove the list
data class TasksUIState(val taskList: List<Task> = listOf()) {
    // Do nothing for now
}

class TasksViewModel : ViewModel(), EventObserver {
    var uiState by mutableStateOf(TasksUIState())
        private set

    init {
        EventBus.subscribe(EventType.SYNC_SUCCESS, this)
        EventBus.subscribe(EventType.LOGOUT_SUCCESS, this)

        refreshTaskList()
    }

    private fun refreshTaskList() {
        viewModelScope.launch {
            uiState = uiState.copy(taskList = TasksOperationsProvider.listTasks().get())
        }
    }

    override fun notify(event: Event) {
        if (event.isOfType(EventType.SYNC_SUCCESS) || event.isOfType(EventType.LOGOUT_SUCCESS)) {
            Log.d("TasksViewModel", "Event notification received")
            refreshTaskList()
        }
    }
}