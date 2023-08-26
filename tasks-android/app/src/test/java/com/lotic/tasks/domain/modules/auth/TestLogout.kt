package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.adapters.modules.auth.gateways.LogoutGateway
import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.auth.operations.Logout
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
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } returns Unit

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authToken

        val mockedLogoutGateway = mockk<LogoutGateway>()
        coEvery { mockedLogoutGateway.call(any()) } returns Unit

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            // Do Nothing
        }

        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            assert(false)
        }

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutGateway)
            underTest.execute()
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(any()) }
        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
        coVerify { mockedLogoutGateway.call(any()) }

        EventBus.clear()
    }

    @Test
    fun shouldSucceed_noActiveSession() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns null

        val mockedLogoutGateway = mockk<LogoutGateway>()

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            // Do Nothing
        }

        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            assert(false)
        }

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutGateway)
            underTest.execute()
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }

        EventBus.clear()
    }

    @Test
    fun shouldFail_currentSessionProviderError() {
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } throws Exception()

        val mockedLogoutGateway = mockk<LogoutGateway>()

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            assert(false)
        }

        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            // Do Nothing
        }

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutGateway)
            try {
                underTest.execute()
            } catch (e: Exception) {
                // Do nothing
            }
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }

        EventBus.clear()
    }

    @Test
    fun shouldFail_gatewayError() {
        val authToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authToken

        val mockedLogoutGateway = mockk<LogoutGateway>()
        coEvery { mockedLogoutGateway.call(any()) } throws Exception()

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            assert(false)
        }

        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            // Do Nothing
        }

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
                , mockedLogoutGateway)
            try {
                underTest.execute()
            } catch (e: Exception) {
                // Do nothing
            }
        }

        coVerify { mockedCurrentActiveAuthSessionProvider.get() }
        coVerify { mockedLogoutGateway.call(any()) }

        EventBus.clear()
    }

    @Test
    fun shouldFail_repositoryError() {
        val authToken = AuthToken(
            UUID.randomUUID().toStr()
            , UUID.randomUUID().toStr()
            , UUID.randomUUID()
            , "")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>()
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(any()) } throws Exception()

        val mockedCurrentActiveAuthSessionProvider = mockk<CurrentActiveAuthSessionProvider>()
        coEvery { mockedCurrentActiveAuthSessionProvider.get() } returns authToken

        val mockedLogoutGateway = mockk<LogoutGateway>()
        coEvery { mockedLogoutGateway.call(any()) } returns Unit

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            // Do Nothing
        }

        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            assert(false)
        }

        runBlocking {
            val underTest = Logout(
                mockedAuthTokenRepository
                , mockedCurrentActiveAuthSessionProvider
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

        EventBus.clear()
    }
}