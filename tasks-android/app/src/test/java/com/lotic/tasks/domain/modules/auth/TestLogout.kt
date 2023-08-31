package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.adapters.modules.auth.gateways.LogoutGateway
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.auth.operations.Logout
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.value_objects.Id
import io.mockk.InternalPlatformDsl.toStr
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestLogout {

    @Test
    fun shouldSucceed() {
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authToken

        val mockedLogoutGateway = mockk<LogoutGateway>()
        coEvery { mockedLogoutGateway.call(any()) } returns Unit

        val mockedLogoutSuccessPublisher = mockk<Publisher<Id<Account>>>()
        coEvery { mockedLogoutSuccessPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutSuccessPublisher
                , mockedLogoutGateway)
            underTest.execute()
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
        coVerify { mockedLogoutGateway.call(any()) }
        coVerify { mockedLogoutSuccessPublisher.publish(any()) }
    }

    @Test
    fun shouldSucceed_noActiveSession() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns null

        val mockedLogoutGateway = mockk<LogoutGateway>()

        val mockedLogoutSuccessPublisher = mockk<Publisher<Id<Account>>>()

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutSuccessPublisher
                , mockedLogoutGateway)
            underTest.execute()
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }

    @Test
    fun shouldFail_currentSessionProviderError() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } throws Exception()

        val mockedLogoutGateway = mockk<LogoutGateway>()

        val mockedLogoutSuccessPublisher = mockk<Publisher<Id<Account>>>()

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutSuccessPublisher
                , mockedLogoutGateway)
            try {
                underTest.execute()
            } catch (e: Exception) {
                // Do nothing
            }
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
    }

    @Test
    fun shouldFail_gatewayError() {
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authToken

        val mockedLogoutGateway = mockk<LogoutGateway>()
        coEvery { mockedLogoutGateway.call(any()) } throws Exception()

        val mockedLogoutSuccessPublisher = mockk<Publisher<Id<Account>>>()

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutSuccessPublisher
                , mockedLogoutGateway)
            try {
                underTest.execute()
            } catch (e: Exception) {
                // Do nothing
            }
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
        coVerify { mockedLogoutGateway.call(any()) }
    }

    @Test
    fun shouldFail_repositoryError() {
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } throws Exception()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authToken

        val mockedLogoutGateway = mockk<LogoutGateway>()
        coEvery { mockedLogoutGateway.call(any()) } returns Unit

        val mockedLogoutSuccessPublisher = mockk<Publisher<Id<Account>>>()

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutSuccessPublisher
                , mockedLogoutGateway)
            try {
                underTest.execute()
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
        coVerify { mockedLogoutGateway.call(any()) }
    }
}