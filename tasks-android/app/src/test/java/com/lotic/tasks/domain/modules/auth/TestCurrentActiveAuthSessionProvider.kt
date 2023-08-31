package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestCurrentActiveAuthSessionProvider {

    @Test
    fun shouldSucceed() {
        val authSession = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.getActiveAuthSession() } returns authSession

        val underTest = CurrentActiveAuthSessionProvider(mockedAuthTokenRepository)
        runBlocking {
            val result = underTest.get()

            assert(result != null)
            assert(result?.token == authSession.token)
        }

        coVerify { mockedAuthTokenRepository.getActiveAuthSession() }
    }

    @Test
    fun shouldFail_authTokenRepositoryError() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.getActiveAuthSession() } throws Exception()

        val underTest = CurrentActiveAuthSessionProvider(mockedAuthTokenRepository)
        runBlocking {
            try {
                underTest.get()
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAuthTokenRepository.getActiveAuthSession() }
    }
}