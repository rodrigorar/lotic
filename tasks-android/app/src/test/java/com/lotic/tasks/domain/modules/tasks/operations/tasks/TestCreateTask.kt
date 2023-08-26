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

class TestCreateTask {

    @Test
    fun shouldSucceed() {
        val input = Task(
            UUID.randomUUID()
            , "Task #1"
            , "Task #1 Description"
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , UUID.randomUUID())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insert(input) } returns Unit

        runBlocking {
            val underTest = CreateTask(mockedTasksRepository)
            underTest.execute(input)
        }

        coVerify { mockedTasksRepository.insert(input) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val input = Task(
            UUID.randomUUID()
            , "Task #1"
            , "Task #1 Description"
            , ZonedDateTime.now()
            , ZonedDateTime.now()
            , UUID.randomUUID())

        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.insert(input) } throws Exception()

        runBlocking {
            val underTest = CreateTask(mockedTasksRepository)
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.insert(input) }
    }
}