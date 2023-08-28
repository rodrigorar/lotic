package com.lotic.tasks.domain.modules.tasks.operations.tasks

import com.lotic.tasks.adapters.modules.tasks.events.TasksCompletedPublisher
import com.lotic.tasks.domain.modules.tasks.TasksRepository
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

        val mockedTasksCompletedPublisher = mockk<TasksCompletedPublisher>()
        coEvery { mockedTasksCompletedPublisher.publish(any()) } returns Unit

        val underTest = CompleteTask(mockedTasksRepository, mockedTasksCompletedPublisher)
        runBlocking {
            underTest.execute(UUID.randomUUID())
        }

        coVerify { mockedTasksRepository.delete(any()) }
        coVerify { mockedTasksCompletedPublisher.publish(any()) }
    }

    @Test
    fun shouldFail_tasksRepositoryError() {
        val mockedTasksRepository = mockk<TasksRepository>()
        coEvery { mockedTasksRepository.delete(any()) } throws Exception()

        val mockedTasksCompletedPublisher = mockk<TasksCompletedPublisher>()

        val underTest = CompleteTask(mockedTasksRepository, mockedTasksCompletedPublisher)
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