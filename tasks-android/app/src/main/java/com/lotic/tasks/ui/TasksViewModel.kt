package com.lotic.tasks.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.lotic.tasks.domain.modules.tasks.dtos.Task

// TODO: Remove the list
data class TasksUIState(val taskList: List<Task> = listOf()) {
    // Do nothing for now
}

class TasksViewModel : ViewModel() {
    var uiState by mutableStateOf(TasksUIState())
        private set
}