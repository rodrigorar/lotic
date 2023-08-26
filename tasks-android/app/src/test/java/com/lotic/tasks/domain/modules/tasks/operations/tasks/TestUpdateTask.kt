package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.domain.modules.tasks.Task
import com.lotic.tasks.domain.modules.tasks.TasksRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.ZonedDateTime
import java.util.*

class TestUpdateTask {

    @Test
    fun shouldSucceed() {
        val input = Task(
            UUID.randomUUID()
            , "Task #1"
            , ""
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , UUID.randomUUID())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.update(any(), any()) } returns Unit

        val underTest = UpdateTask(mockedTasksRepository)
        runBlocking {
            underTest.execute(input)
        }

        coVerify { mockedTasksRepository.update(any(), any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val input = Task(
            UUID.randomUUID()
            , "Task #1"
            , ""
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , UUID.randomUUID())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.update(any(), any()) } throws Exception()

        val underTest = UpdateTask(mockedTasksRepository)
        runBlocking {
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.update(any(), any()) }
    }
}