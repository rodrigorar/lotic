package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
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

class TestListTasks {

    @Test
    fun shouldSucceed_withResults() {
        val accountId = Account.newId()
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), accountId, "")
        val repoResult = listOf(
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
        val accountId = Account.newId()
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), accountId, "")
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
        val accountId = Account.newId()
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), accountId, "")

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