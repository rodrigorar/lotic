package com.lotic.tasks.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.toMutableStateList
import androidx.compose.runtime.toMutableStateMap
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lotic.tasks.adapters.modules.auth.AuthOperationsProvider
import com.lotic.tasks.adapters.modules.auth.events.LoginSuccessPublisher
import com.lotic.tasks.adapters.modules.auth.events.LogoutSuccessPublisher
import com.lotic.tasks.adapters.modules.tasks.TasksOperationsProvider
import com.lotic.tasks.adapters.modules.tasks.events.TasksCompletedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksCreatedPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksSyncSuccessPublisher
import com.lotic.tasks.adapters.modules.tasks.events.TasksUpdatedPublisher
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.tasks.SyncManager
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Subscriber
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Id
import com.lotic.tasks.domain.shared.value_objects.Position
import com.lotic.tasks.domain.shared.value_objects.Title
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.time.ZonedDateTime
import java.util.*

// TODO: Remove the list
data class TasksUIState(
    val taskList: List<Task> = listOf()
    , val taskTitles: MutableMap<UUID, String> = mutableMapOf()
    , val taskCheckboxes: MutableMap<UUID, Boolean> = mutableMapOf()
    , val isLoggedIn: Boolean = false
    , val isRefreshing: Boolean = false
    , val isDropdownMenuExpanded: Boolean = false) {
    // Do nothing for now
}

class LoginSuccessSubscriber(private val viewModel: TasksViewModel) : Subscriber<AuthToken>() {
    override fun notify(event: Event<AuthToken>) {
        this.viewModel.updateState(this.viewModel.uiState.copy(isLoggedIn = true))
    }
}

class LogoutSuccessSubscriber(private val viewModel: TasksViewModel) : Subscriber<Id<Account>>() {
    override fun notify(event: Event<Id<Account>>) {
        this.viewModel.updateState(this.viewModel.uiState.copy(isLoggedIn = false))
        this.viewModel.viewModelScope.launch {
            delay(100)
            viewModel.refreshTaskList()
        }
    }
}

class TasksCreatedSubscriber(private val viewModel: TasksViewModel) : Subscriber<List<Id<Task>>>() {
    override fun notify(event: Event<List<Id<Task>>>) {
        this.viewModel.viewModelScope.launch {
            delay(100)
            viewModel.refreshTaskList()
        }
    }
}

class TasksUpdatedSubscriber(private val viewModel: TasksViewModel) : Subscriber<Id<Task>>() {
    override fun notify(event: Event<Id<Task>>) {
        this.viewModel.viewModelScope.launch {
            delay(100)
            viewModel.refreshTaskList()
        }
    }
}

class TasksCompletedSubscriber(private val viewModel: TasksViewModel) : Subscriber<Id<Task>>() {
    override fun notify(event: Event<Id<Task>>) {
        this.viewModel.viewModelScope.launch {
            delay(100)
            viewModel.refreshTaskList()
        }
    }
}

class TasksViewModel : ViewModel() {
    var uiState by mutableStateOf(TasksUIState())
        private set

    fun updateState(uiState: TasksUIState) {
        this.uiState = uiState
    }

    init {
        LoginSuccessPublisher.register(LoginSuccessSubscriber(this))
        LogoutSuccessPublisher.register(LogoutSuccessSubscriber(this))
        TasksCreatedPublisher.register(TasksCreatedSubscriber(this))
        TasksSyncSuccessPublisher.register(TasksCreatedSubscriber(this))
        TasksUpdatedPublisher.register(TasksUpdatedSubscriber(this))
        TasksCompletedPublisher.register(TasksCompletedSubscriber(this))

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

    fun toggleDropdownMenu() {
        this.uiState = this.uiState.copy(isDropdownMenuExpanded = ! this.uiState.isDropdownMenuExpanded)
    }

    fun createNewTask() {
        // FIXME: It makes no sense to have a database call to create a new task
        viewModelScope.launch {
            val currentActiveAuthSessionProvider = AuthOperationsProvider.currentActiveAuthSessionProvider()
            val createTaskOperation = TasksOperationsProvider.createTask()

            var maxPosition = 0;
            uiState.taskList.forEach {
                if (it.position.value > maxPosition) {
                    maxPosition = it.position.value
                }
            }

            createTaskOperation.execute(
                Task(
                    id = Task.newId()
                    , title = Title.of("")
                    , description = Description.of("")
                    , position = Position.of(maxPosition + 1)
                    , createdAt = ZonedDateTime.now()
                    , updatedAt = ZonedDateTime.now()
                    , ownerId = currentActiveAuthSessionProvider.get()?.accountId)
            )
        }
    }

    fun updateTaskTitle(task: Task, newTaskTitle: String) {
        this.uiState.taskTitles[task.id.value] = newTaskTitle
        viewModelScope.launch {
            val updateTaskOperation = TasksOperationsProvider.updateTask()
            updateTaskOperation.execute(task.copy(title = Title.of(newTaskTitle)))
        }
    }

    fun toggleComplete(task: Task) {
        this.uiState.taskCheckboxes[task.id.value] = this.uiState.taskCheckboxes[task.id.value]?.not() ?: false
        viewModelScope.launch {
            delay(1000)
            // I was forced to do this idiocracy == true :facepalm:
            uiState.taskCheckboxes.entries.forEach {
                if (it.value) {
                    val completeTaskOperation = TasksOperationsProvider.completeTasks()
                    completeTaskOperation.execute(Task.idOf(it.key))
                    uiState.taskCheckboxes[it.key] = false
                }
            }
        }
    }

    suspend fun verifyIfLoggedIn() {
        val authToken: AuthToken? = AuthOperationsProvider.currentActiveAuthSessionProvider().get()
        uiState = uiState.copy(isLoggedIn = authToken != null)
    }

    // FIXME: Coalesce these two functions, it will be easier to understand
    fun refresh() {
        uiState = uiState.copy(isRefreshing = true)
        SyncManager.execute()
        uiState = uiState.copy(isRefreshing = false)
    }

    suspend fun refreshTaskList() {
        val taskList = TasksOperationsProvider.listTasks().get()
        uiState = uiState.copy(
            taskList = taskList
            , taskTitles = taskList.map { it.id.value to it.title.value }.toMutableStateMap()
            , taskCheckboxes = taskList.map { it.id.value to false }.toMutableStateMap())
    }

    fun reorderTask(from: Int, to: Int) {
        val mutableTaskList = uiState.taskList.toMutableStateList()
        mutableTaskList.apply { add(to, removeAt(from)) }
        uiState = uiState.copy(taskList = mutableTaskList.toList())

        viewModelScope.launch {
            val updateTaskOperation = TasksOperationsProvider.updateTask();

            val fromTask = uiState.taskList[from];
            updateTaskOperation.execute(fromTask.copy(position = Position.of(from)))

            val toTask = uiState.taskList[to];
            updateTaskOperation.execute(toTask.copy(position = Position.of(to)))
        }
    }
}