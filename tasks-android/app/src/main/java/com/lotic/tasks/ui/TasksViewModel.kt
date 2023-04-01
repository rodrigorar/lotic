package com.lotic.tasks.ui

import androidx.lifecycle.ViewModel
import com.lotic.tasks.domain.modules.tasks.dtos.Task
import com.lotic.tasks.domain.modules.tasks.listTasksProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class TasksUIState(val taskList: List<Task> = listOf()) {
    // Do nothing for now
}

class TasksViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(
        TasksUIState(taskList = listTasksProvider().get())
    )
    val uiState: StateFlow<TasksUIState> = _uiState.asStateFlow()

    fun getAccountTasks() {
        val listTasksService = listTasksProvider()
        _uiState.update { currentState ->
            currentState.copy(taskList = listTasksService.get())
        }
    }
}