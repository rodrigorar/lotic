package com.lotic.tasks.domain.modules.tasks.operations.tasks

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
import java.util.*

class TestClearTasksForAccount {

    @Test
    fun shouldSucceed() {
        val accountId = Account.newId()
        val dataResult = listOf(
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
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns dataResult
        coEvery { mockedTasksRepository.deleteMultiple(any()) } returns Unit

        val underTest = ClearTasksForAccount(mockedTasksRepository)
        runBlocking {
            underTest.execute(Account.newId())
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
            underTest.execute(Account.newId())
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val accountId = Account.newId()
        val dataResult = listOf(
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
        coEvery { mockedTasksRepository.listTasksForAccount(any()) } returns dataResult
        coEvery { mockedTasksRepository.deleteMultiple(any()) } throws Exception()

        val underTest = ClearTasksForAccount(mockedTasksRepository)
        runBlocking {
            try {
                underTest.execute(Account.newId())
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.listTasksForAccount(any()) }
        coVerify { mockedTasksRepository.deleteMultiple(any()) }
    }
}