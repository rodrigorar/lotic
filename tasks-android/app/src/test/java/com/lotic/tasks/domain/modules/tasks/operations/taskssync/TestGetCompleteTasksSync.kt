package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestGetCompleteTasksSync {

    @Test
    fun shouldSucceed() {
        val dataResult = listOf(
            TasksSync(TasksSync.newId(), Task.newId(), SyncStatus.COMPLETE, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(TasksSync.newId(), Task.newId(), SyncStatus.COMPLETE, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(TasksSync.newId(), Task.newId(), SyncStatus.COMPLETE, ZonedDateTime.now(), ZonedDateTime.now())
        )
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByStatus(any()) } returns dataResult

        val underTest = GetCompleteTasksSync(mockedTasksSyncRepository)
        runBlocking {
            val result = underTest.get()

            assert(result.isNotEmpty())
            assert(result.size == dataResult.size)
        }

        coVerify { mockedTasksSyncRepository.getByStatus(any()) }
    }

    @Test
    fun shouldSucceed_noResult() {
        val dataResult: List<TasksSync> = listOf()
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByStatus(any()) } returns dataResult

        val underTest = GetCompleteTasksSync(mockedTasksSyncRepository)
        runBlocking {
            val result = underTest.get()

            assert(result.isEmpty())
        }

        coVerify { mockedTasksSyncRepository.getByStatus(any()) }
    }

    @Test
    fun shouldFail_tasksSyncRepositoryError() {
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByStatus(any()) } throws Exception()

        val underTest = GetCompleteTasksSync(mockedTasksSyncRepository)
        runBlocking {
            try {
                underTest.get()
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksSyncRepository.getByStatus(any()) }
    }
}