package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.tasks.operations.tasks.ClearTasksForAccount
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestClearTasksForAccount {

    @Test
    fun shouldSucceed() {
        val accountId = UUID.randomUUID()
        val dataResult = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns dataResult
        coEvery { mockedTasksRepository.deleteMultiple(any()) } returns Unit

        val underTest = ClearTasksForAccount(mockedTasksRepository)
        runBlocking {
            underTest.execute(UUID.randomUUID())
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
        coVerify { mockedTasksRepository.deleteMultiple(any()) }
    }

    @Test
    fun shouldSucceed_noResult() {
        val dataResult: List<Task> = listOf()

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns dataResult

        val underTest = ClearTasksForAccount(mockedTasksRepository)
        runBlocking {
            underTest.execute(UUID.randomUUID())
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val accountId = UUID.randomUUID()
        val dataResult = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns dataResult
        coEvery { mockedTasksRepository.deleteMultiple(any()) } throws Exception()

        val underTest = ClearTasksForAccount(mockedTasksRepository)
        runBlocking {
            try {
                underTest.execute(UUID.randomUUID())
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
        coVerify { mockedTasksRepository.deleteMultiple(any()) }
    }
}