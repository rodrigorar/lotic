package com.lotic.tasks.domain.modules.tasks.operations.taskssync

import com.lotic.tasks.domain.modules.tasks.SyncStatus
import com.lotic.tasks.domain.modules.tasks.TasksSync
import com.lotic.tasks.domain.modules.tasks.TasksSyncRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestGetDirtyTasksSync {

    @Test
    fun shouldSucceed() {
        val dataResult = listOf(
            TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
        )
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByStatus(any()) } returns dataResult

        val underTest = GetDirtyTasksSync(mockedTasksSyncRepository)
        runBlocking {
            val result = underTest.get()

            assert(result.isNotEmpty())
            assert(result.size == dataResult.size)
        }

        coVerify { mockedTasksSyncRepository.getByStatus(any()) }
    }

    @Test
    fun shouldSucceed_noTasks() {
        val dataResult: List<TasksSync> = listOf()
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByStatus(any()) } returns dataResult

        val underTest = GetDirtyTasksSync(mockedTasksSyncRepository)
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

        val underTest = GetDirtyTasksSync(mockedTasksSyncRepository)
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