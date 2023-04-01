package com.lotic.tasks.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.modules.tasks.SyncManager
import com.lotic.tasks.domain.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.operations.ListTasks
import kotlinx.coroutines.launch

data class TasksUIState(val taskList: List<Task> = listOf()) {
    // Do nothing for now
}

class TasksViewModel : ViewModel() {
    var uiState by mutableStateOf(TasksUIState())
        private set

    private val listTasksOperation: ListTasks = TasksOperationsProvider.listTasks()

    fun getAccountTasks() {
        viewModelScope.launch {
            uiState = uiState.copy(taskList = listTasksOperation.get())
        }
    }
}