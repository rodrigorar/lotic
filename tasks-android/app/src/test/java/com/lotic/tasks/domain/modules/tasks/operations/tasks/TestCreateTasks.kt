package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import com.lotic.tasks.domain.shared.events.Publisher
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

        val mockedTasksCreatedPublisher = mockk<Publisher<List<UUID>>>()
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
        val accountId = UUID.randomUUID()
        val input = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insertMultiple(input) } throws Exception()

        val mockedTasksCreatedPublisher = mockk<Publisher<List<UUID>>>()

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