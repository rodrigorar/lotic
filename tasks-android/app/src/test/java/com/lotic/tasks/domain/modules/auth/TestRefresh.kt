package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.operations.Logout
import com.lotic.tasks.domain.modules.auth.operations.Refresh
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import com.lotic.tasks.domain.shared.Gateway
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test

class TestRefresh {

    @Test
    fun shouldSucceed() {
        val oldAuthToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } returns Unit

        val mockedLogoutOperation = mockk<Logout>()

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } returns authToken

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedLogoutOperation, mockedRefreshGateway)
            underTest.execute(oldAuthToken)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedRefreshGateway.call(any()) }
    }

    @Test
    fun shouldSucceed_noResult() {
        val oldAuthToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit

        val mockedLogoutOperation = mockk<Logout>()

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } returns null

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedLogoutOperation, mockedRefreshGateway)
            underTest.execute(oldAuthToken)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedRefreshGateway.call(any()) }
    }

    @Test
    fun shouldFail_gatewayError() {
        val oldAuthToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()

        val mockedLogoutOperation = mockk<Logout>()
        coEvery { mockedLogoutOperation.execute() } returns Unit

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } throws Exception()

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedLogoutOperation, mockedRefreshGateway)
            underTest.execute(oldAuthToken)
        }

        coVerify { mockedRefreshGateway.call(any()) }
    }

    @Test
    fun shouldFail_repositoryError() {
        val oldAuthToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } throws Exception()

        val mockedLogoutOperation = mockk<Logout>()
        coEvery { mockedLogoutOperation.execute() } returns Unit

        val mockedRefreshGateway = mockk<Gateway<AuthToken, AuthToken?>>()
        coEvery { mockedRefreshGateway.call(any()) } returns authToken

        runBlocking {
            val underTest = Refresh(mockedAuthTokenRepository, mockedLogoutOperation, mockedRefreshGateway)
            underTest.execute(oldAuthToken)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedLogoutOperation.execute() }
        coVerify { mockedRefreshGateway.call(any()) }
    }
}