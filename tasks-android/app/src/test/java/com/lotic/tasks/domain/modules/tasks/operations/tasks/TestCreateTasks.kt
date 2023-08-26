package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestCreateTasks {

    @Test
    fun shouldSucceed() {
        val accountId = UUID.randomUUID()
        val input = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insertMultiple(input) } returns Unit

        runBlocking {
            val underTest = CreateTasks(mockedTasksRepository)
            underTest.execute(input)
        }

        coVerify { mockedTasksRepository.insertMultiple(input) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val accountId = UUID.randomUUID()
        val input = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insertMultiple(input) } throws Exception()

        runBlocking {
            val underTest = CreateTasks(mockedTasksRepository)
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.insertMultiple(input) }
    }
}