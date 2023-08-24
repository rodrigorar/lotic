package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.tasks.operations.tasks.ListTasks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestListTasks {

    @Test
    fun shouldSucceed_withResults() {
        val accountId = UUID.randomUUID()
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), accountId, "")
        val repoResult = listOf(
            Task(UUID.randomUUID(), "Task #1", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #2", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
            , Task(UUID.randomUUID(), "Task #3", "", ZonedDateTime.now(), ZonedDateTime.now(), accountId)
        )

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns repoResult

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authSession

        val underTest = ListTasks(mockedCurrentActiveAuthSessionProvider, mockedTasksRepository)
        runBlocking {
            val result = underTest.get()

            assert(result.isNotEmpty())
            assert(result.size == 3)
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }

    @Test
    fun shouldSucceed_withoutResults() {
        val accountId = UUID.randomUUID()
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), accountId, "")
        val repoResult: List<Task> = listOf()

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns repoResult

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authSession

        val underTest = ListTasks(mockedCurrentActiveAuthSessionProvider, mockedTasksRepository)
        runBlocking {
            val result = underTest.get()

            assert(result.isEmpty())
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }

    @Test
    fun shouldSucceed_noAuthSession() {
        val mockedTasksRepository = mockk<TasksRepository>()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns null

        val underTest = ListTasks(mockedCurrentActiveAuthSessionProvider, mockedTasksRepository)
        runBlocking {
            val result = underTest.get()

            assert(result.isEmpty())
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }

    @Test
    fun shouldFail_activeAuthSessionProviderError() {
        val mockedTasksRepository = mockk<TasksRepository>()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } throws Exception()

        val underTest = ListTasks(mockedCurrentActiveAuthSessionProvider, mockedTasksRepository)
        runBlocking {
            try {
                underTest.get()
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val accountId = UUID.randomUUID()
        val authSession = AuthToken(UUID.randomUUID().toString(), UUID.randomUUID().toString(), accountId, "")

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } throws Exception()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authSession

        val underTest = ListTasks(mockedCurrentActiveAuthSessionProvider, mockedTasksRepository)
        runBlocking {
            try {
                underTest.get()
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }
}