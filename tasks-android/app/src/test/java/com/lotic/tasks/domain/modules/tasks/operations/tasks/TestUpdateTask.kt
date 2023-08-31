package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.value_objects.Description
import com.lotic.tasks.domain.shared.value_objects.Id
import com.lotic.tasks.domain.shared.value_objects.Title
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestUpdateTask {

    @Test
    fun shouldSucceed() {
        val input = Task(
            Task.newId()
            , Title.of("Task #1")
            , Description.of("")
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , Account.newId())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.update(any()) } returns Unit

        val mockedTasksUpdatedPublisher = mockk<Publisher<Id<Task>>>()
        coEvery { mockedTasksUpdatedPublisher.publish(any()) } returns Unit

        val underTest = UpdateTask(mockedTasksRepository, mockedTasksUpdatedPublisher)
        runBlocking {
            underTest.execute(input)
        }

        coVerify { mockedTasksRepository.update(any()) }
        coVerify { mockedTasksUpdatedPublisher.publish(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val input = Task(
            Task.newId()
            , Title.of("Task #1")
            , Description.of("")
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , Account.newId())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.update(any()) } throws Exception()

        val mockedTasksUpdatedPublisher = mockk<Publisher<Id<Task>>>()

        val underTest = UpdateTask(mockedTasksRepository, mockedTasksUpdatedPublisher)
        runBlocking {
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.update(any()) }
    }
}