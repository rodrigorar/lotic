package com.lotic.tasks.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.toMutableStateMap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.domain.events.Event
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventObserver
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.adapters.modules.auth.events.LoginSuccessPublisher
import com.lotic.tasks.adapters.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.shared.events.Subscriber
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.ZonedDateTime
import java.util.*

// TODO: Remove the list
data class TasksUIState(
    val taskList: List<Task> = listOf()
    , val taskTitles: MutableMap<UUID, String> = mutableMapOf()
    , val taskCheckboxes: MutableMap<UUID, Boolean> = mutableMapOf()
    , val isLoggedIn: Boolean) {
    // Do nothing for now
}

class LoginSuccessSubscriber(private val viewModel: TasksViewModel) : Subscriber<AuthToken>() {
    override fun notify(event: com.lotic.tasks.domain.shared.events.Event<AuthToken>) {
        this.viewModel.updateState(this.viewModel.uiState.copy(isLoggedIn = true))
    }
}

class LogoutSuccessPublisher(private val viewModel: TasksViewModel) : Subscriber<UUID>() {
    override fun notify(event: com.lotic.tasks.domain.shared.events.Event<UUID>) {
        this.viewModel.updateState(this.viewModel.uiState.copy(isLoggedIn = false))
        this.viewModel.viewModelScope.launch {
            delay(100)
            viewModel.refreshTaskList()
        }
    }
}

class TasksViewModel : ViewModel(), EventObserver {
    var uiState by mutableStateOf(TasksUIState(isLoggedIn = false))
        private set

    override fun notify(event: Event) {
        if (event.isOfType(EventType.SYNC_SUCCESS)
            || event.isOfType(EventType.TASKS_UPDATED)
            || event.isOfType(EventType.TASKS_CREATED)
            || event.isOfType(EventType.TASKS_COMPLETED)) {
            viewModelScope.launch {
                delay(200)
                refreshTaskList()
            }
        }
    }

    fun updateState(uiState: TasksUIState) {
        this.uiState = uiState
    }

    init {
        LoginSuccessPublisher.register(LoginSuccessSubscriber(this))

        EventBus.subscribe(
            eventTypes = listOf(
                EventType.SYNC_SUCCESS
                , EventType.LOGOUT_SUCCESS
                , EventType.TASKS_UPDATED
                , EventType.TASKS_CREATED
                , EventType.TASKS_COMPLETED)
            , observer = this
        )

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

    fun createNewTask() {
        // FIXME: It makes no sense to have a database call to create a new task
        viewModelScope.launch {
            val currentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()
            val createTaskOperation = TasksOperationsProvider.createTask()

            createTaskOperation.execute(
                Task(
                    id = UUID.randomUUID()
                    , title = ""
                    , description = ""
                    , createdAt = ZonedDateTime.now()
                    , updatedAt = ZonedDateTime.now()
                    , ownerId = currentActiveAuthSessionProvider.get()?.accountId)
            )
        }
    }

    fun updateTaskTitle(task: Task, newTaskTitle: String) {
        this.uiState.taskTitles[task.id] = newTaskTitle
        viewModelScope.launch {
            val updateTaskOperation = TasksOperationsProvider.updateTask()
            updateTaskOperation.execute(task.copy(title = newTaskTitle))
        }
    }

    fun toggleComplete(task: Task) {
        this.uiState.taskCheckboxes[task.id] = this.uiState.taskCheckboxes[task.id]?.not() ?: false
        viewModelScope.launch {
            delay(1000)
            // I was force to do this idiocracy == true :facepalm:
            if (uiState.taskCheckboxes[task.id] == true) {
                val completeTaskOperation = TasksOperationsProvider.completeTasks()
                completeTaskOperation.execute(task.id)
                uiState.taskCheckboxes[task.id] = false
            }
        }
    }

    suspend fun verifyIfLoggedIn() {
        val authToken: AuthToken? = AuthOperationsProvider.currentActiveAuthSessionProvider().get()
        uiState = uiState.copy(isLoggedIn = authToken != null)
    }

    suspend fun refreshTaskList() {
        val taskList = TasksOperationsProvider.listTasks().get()
        uiState = uiState.copy(
            taskList = taskList
            , taskTitles = taskList.map { it.id to it.title }.toMutableStateMap()
            , taskCheckboxes = taskList.map { it.id to false }.toMutableStateMap())
    }
}