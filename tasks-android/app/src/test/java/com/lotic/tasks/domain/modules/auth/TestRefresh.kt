package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.auth.operations.Refresh
import com.lotic.tasks.domain.shared.Gateway
import io.mockk.InternalPlatformDsl.toStr
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestRefresh {

    @Test
    fun shouldSucceed() {
        val oldAuthToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")
        val authToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } returns Unit

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } returns authToken

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedRefreshGateway)
            underTest.execute(oldAuthToken)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedRefreshGateway.call(any()) }
    }

    @Test
    fun shouldSucceed_noResult() {
        val oldAuthToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } returns null

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedRefreshGateway)
            underTest.execute(oldAuthToken)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedRefreshGateway.call(any()) }
    }

    @Test
    fun shouldFail_gatewayError() {
        val oldAuthToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")
        val authToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } throws Exception()

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedRefreshGateway)
            try {
                underTest.execute(oldAuthToken)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedRefreshGateway.call(any()) }
    }

    @Test
    fun shouldFail_repositoryError() {
        val oldAuthToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")
        val authToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } throws Exception()

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } returns authToken

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedRefreshGateway)
            try {
                underTest.execute(oldAuthToken)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedRefreshGateway.call(any()) }
    }
}