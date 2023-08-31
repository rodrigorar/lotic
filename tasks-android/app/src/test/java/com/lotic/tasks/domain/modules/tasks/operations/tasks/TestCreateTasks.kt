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

class TestCreateTasks {

    @Test
    fun shouldSucceed() {
        val accountId = Account.newId()
        val input = listOf(
            Task(
                Task.newId()
                , Title.of("Task #1")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , accountId)
            , Task(
                Task.newId()
                , Title.of("Task #2")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , accountId)
            , Task(
                Task.newId()
                , Title.of("Task #3")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insertMultiple(input) } returns Unit

        val mockedTasksCreatedPublisher = mockk<Publisher<List<Id<Task>>>>()
        coEvery { mockedTasksCreatedPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = CreateTasks(mockedTasksRepository, mockedTasksCreatedPublisher)
            underTest.execute(input)
        }

        coVerify { mockedTasksRepository.insertMultiple(input) }
        coVerify { mockedTasksCreatedPublisher.publish(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val accountId = Account.newId()
        val input = listOf(
            Task(
                Task.newId()
                , Title.of("Task #1")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , accountId)
            , Task(
                Task.newId()
                , Title.of("Task #2")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , accountId)
            , Task(
                Task.newId()
                , Title.of("Task #3")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insertMultiple(input) } throws Exception()

        val mockedTasksCreatedPublisher = mockk<Publisher<List<Id<Task>>>>()

        runBlocking {
            val underTest = CreateTasks(mockedTasksRepository, mockedTasksCreatedPublisher)
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.insertMultiple(input) }
    }
}