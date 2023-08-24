package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.auth.operations.ClearSessions
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestClearSessions {

    @Test
    fun shouldSucceed() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit

        val underTest = ClearSessions(mockedAuthTokenRepository)
        runBlocking {
            underTest.execute(UUID.randomUUID())
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
    }

    @Test
    fun shouldFail_repositoryError() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } throws Exception()

        val underTest = ClearSessions(mockedAuthTokenRepository)
        runBlocking {
            try {
                underTest.execute(UUID.randomUUID())
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
    }
}