package com.lotic.tasks.domain.modules.tasks

import com.lotic.tasks.domain.modules.tasks.operations.tasks.CompleteTask
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestCompleteTask {

    @Test
    fun shouldSucceed() {
        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.delete(any()) } returns Unit

        val underTest = CompleteTask(mockedTasksRepository)
        runBlocking {
            underTest.execute(UUID.randomUUID())
        }

        coVerify { mockedTasksRepository.delete(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.delete(any()) } throws Exception()

        val underTest = CompleteTask(mockedTasksRepository)
        runBlocking {
            try {
                underTest.execute(UUID.randomUUID())
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedTasksRepository.delete(any()) }
    }
}