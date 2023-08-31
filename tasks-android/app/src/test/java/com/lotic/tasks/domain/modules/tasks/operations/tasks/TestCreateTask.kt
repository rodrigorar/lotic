package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.adapters.modules.tasks.events.TasksCreatedPublisher
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Title
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime

class TestCreateTask {

    @Test
    fun shouldSucceed() {
        val input = Task(
            Task.newId()
            , Title.of("Task #1")
            , Description.of("Task #1 Description")
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , Account.newId())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insert(input) } returns Unit

        val mockedTasksCreatedPublisher = mockk<TasksCreatedPublisher>()
        coEvery { mockedTasksCreatedPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = CreateTask(mockedTasksRepository, mockedTasksCreatedPublisher)
            underTest.execute(input)
        }

        coVerify { mockedTasksRepository.insert(input) }
        coVerify { mockedTasksCreatedPublisher.publish(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val input = Task(
            Task.newId()
            , Title.of("Task #1")
            , Description.of("Task #1 Description")
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , Account.newId())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insert(input) } throws Exception()

        val mockedTasksCreatedPublisher = mockk<TasksCreatedPublisher>()

        runBlocking {
            val underTest = CreateTask(mockedTasksRepository, mockedTasksCreatedPublisher)
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.insert(input) }
    }
}