package com.lotic.tasks.ui

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TasksUIState() {
    // Do nothing for now
}

class TasksViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(TasksUIState())
    val uiState: StateFlow<TasksUIState> = _uiState.asStateFlow()
}