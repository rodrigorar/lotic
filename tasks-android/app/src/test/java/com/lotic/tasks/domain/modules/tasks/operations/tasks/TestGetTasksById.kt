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
import java.util.*

class TestGetTasksById {

    @Test
    fun shouldSucceed() {
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), Account.newId(), "")
        val dataResult = listOf(
            Task(
                Task.newId()
                , Title.of("Task #1")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
            , Task(
                Task.newId()
                , Title.of("Task #2")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
            , Task(
                Task.newId()
                , Title.of("Task #3")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
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
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), Account.newId(), "")
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
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), Account.newId(), "")
        val dataResult = listOf(
            Task(
                Task.newId()
                , Title.of("Task #1")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
            , Task(
                Task.newId()
                , Title.of("Task #2")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
            , Task(
                Task.newId()
                , Title.of("Task #3")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
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
        val authSession = AuthToken(AccessToken.new(), RefreshToken.new(), Account.newId(), "")
        val dataResult = listOf(
            Task(
                Task.newId()
                , Title.of("Task #1")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
            , Task(
                Task.newId()
                , Title.of("Task #2")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
            , Task(
                Task.newId()
                , Title.of("Task #3")
                , Description.of("")
                , ZonedDateTime.now()
                , ZonedDateTime.now()
                , authSession.accountId)
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