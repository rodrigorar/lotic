package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.operations.tasks.GetTasksById
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestGetTasksById {

    @Test
    fun shouldSucceed() {
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), UUID.randomUUID(), "")
        val dataResult = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.getTasksById(any(), any()) } returns dataResult

        val mockedAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedAuthSessionProvider.get() } returns authSession

        val underTest = GetTasksById(mockedTasksRepository, mockedAuthSessionProvider)
        runBlocking {
            val result = underTest.execute(dataResult.map { it.id })

            assert(result.isNotEmpty())
            assert(result.size == dataResult.size)
        }

        coVerify { mockedTasksRepository.getTasksById(any(), any()) }
        coVerify { mockedAuthSessionProvider.get() }
    }

    @Test
    fun shouldSucceed_noResult() {
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), UUID.randomUUID(), "")
        val dataResult: List<Task> = listOf()

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.getTasksById(any(), any()) } returns dataResult

        val mockedAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedAuthSessionProvider.get() } returns authSession

        val underTest = GetTasksById(mockedTasksRepository, mockedAuthSessionProvider)
        runBlocking {
            val result = underTest.execute(dataResult.map { it.id })

            assert(result.isEmpty())
        }

        coVerify { mockedTasksRepository.getTasksById(any(), any()) }
        coVerify { mockedAuthSessionProvider.get() }
    }

    @Test
    fun shouldFail_authSessionProviderError() {
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), UUID.randomUUID(), "")
        val dataResult = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.getTasksById(any(), any()) } returns dataResult

        val mockedAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedAuthSessionProvider.get() } throws Exception()

        val underTest = GetTasksById(mockedTasksRepository, mockedAuthSessionProvider)
        runBlocking {
            try {
                underTest.execute(dataResult.map { it.id })
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAuthSessionProvider.get() }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), UUID.randomUUID(), "")
        val dataResult = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), authSession.accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.getTasksById(any(), any()) } throws Exception()

        val mockedAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedAuthSessionProvider.get() } returns authSession

        val underTest = GetTasksById(mockedTasksRepository, mockedAuthSessionProvider)
        runBlocking {
            try {
                underTest.execute(dataResult.map { it.id })
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.getTasksById(any(), any()) }
        coVerify { mockedAuthSessionProvider.get() }
    }
}