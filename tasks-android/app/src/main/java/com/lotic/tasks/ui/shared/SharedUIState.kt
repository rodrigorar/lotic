package com.lotic.tasks.ui.shared

import com.lotic.tasks.domain.modules.tasks.dtos.Task

data class SharedUIState(
    val isLoggedIn: Boolean = false
    , val taskList: List<Task> = listOf())
