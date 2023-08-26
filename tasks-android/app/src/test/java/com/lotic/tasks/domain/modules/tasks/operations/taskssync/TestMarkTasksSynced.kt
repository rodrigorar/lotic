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

class TestMarkTasksSynced {

    @Test
    fun shouldSucceed() {
        val dataResult = listOf(
            TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.LOCAL, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
        )
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByTaskIds(any()) } returns dataResult
        coEvery { mockedTasksSyncRepository.updateMultiple(any()) } returns Unit

        val underTest = MarkTasksSynced(mockedTasksSyncRepository)
        runBlocking {
            underTest.execute(dataResult.map { it.taskId })
        }

        coVerify { mockedTasksSyncRepository.getByTaskIds(any()) }
        coVerify { mockedTasksSyncRepository.updateMultiple(any()) }
    }

    @Test
    fun shouldSucceed_noResult() {
        val dataResult: List<TasksSync> = listOf()
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByTaskIds(any()) } returns dataResult

        val underTest = MarkTasksSynced(mockedTasksSyncRepository)
        runBlocking {
            underTest.execute(dataResult.map { it.taskId })
        }

        coVerify { mockedTasksSyncRepository.getByTaskIds(any()) }
    }

    @Test
    fun shouldFail_tasksSyncRepositoryError() {
        val dataResult = listOf(
            TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.LOCAL, ZonedDateTime.now(), ZonedDateTime.now())
            , TasksSync(UUID.randomUUID(), UUID.randomUUID(), SyncStatus.DIRTY, ZonedDateTime.now(), ZonedDateTime.now())
        )
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByTaskIds(any()) } returns dataResult
        coEvery { mockedTasksSyncRepository.updateMultiple(any()) } throws Exception()

        val underTest = MarkTasksSynced(mockedTasksSyncRepository)
        runBlocking {
            try {
                underTest.execute(dataResult.map { it.taskId })
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksSyncRepository.getByTaskIds(any()) }
        coVerify { mockedTasksSyncRepository.updateMultiple(any()) }
    }
}