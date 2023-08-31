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

class TestDeleteTaskSyncByTaskId {

    @Test
    fun shouldSucceed() {
        val dataResult = TasksSync(
            TasksSync.newId()
            , Task.newId()
            , SyncStatus.LOCAL
            , ZonedDateTime.now()
            , ZonedDateTime.now())

        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByTaskId(any()) } returns dataResult
        coEvery { mockedTasksSyncRepository.delete(any()) } returns Unit

        val underTest = DeleteTaskSyncByTaskId(mockedTasksSyncRepository)
        runBlocking {
            underTest.execute(Task.newId())
        }

        coVerify { mockedTasksSyncRepository.getByTaskId(any()) }
        coVerify { mockedTasksSyncRepository.delete(any()) }
    }

    @Test
    fun shouldSucceed_noTasks() {
        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByTaskId(any()) } returns null

        val underTest = DeleteTaskSyncByTaskId(mockedTasksSyncRepository)
        runBlocking {
            underTest.execute(Task.newId())
        }

        coVerify { mockedTasksSyncRepository.getByTaskId(any()) }
    }

    @Test
    fun shouldFail_tasksSyncRepositoryError() {
        val dataResult = TasksSync(
            TasksSync.newId()
            , Task.newId()
            , SyncStatus.LOCAL
            , ZonedDateTime.now()
            , ZonedDateTime.now())

        val mockedTasksSyncRepository = mockk<TasksSyncRepository>()
        coEvery { mockedTasksSyncRepository.getByTaskId(any()) } returns dataResult
        coEvery { mockedTasksSyncRepository.delete(any()) } throws Exception()

        val underTest = DeleteTaskSyncByTaskId(mockedTasksSyncRepository)
        runBlocking {
            try {
                underTest.execute(Task.newId())
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksSyncRepository.getByTaskId(any()) }
        coVerify { mockedTasksSyncRepository.delete(any()) }
    }
}