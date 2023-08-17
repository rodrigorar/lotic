package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.events.EventBus
import com.lotic.tasks.domain.events.EventType
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.operations.Login
import com.lotic.tasks.domain.shared.Command
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.Query
import io.mockk.InternalPlatformDsl.toStr
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.Instant
import java.util.*

class TestLogin {

    @Test
    fun testShouldSucceedNoNewAccount() {
        val input = Credentials("test@mail.net", "passwd")
        val authToken = AuthToken(
            UUID.randomUUID().toString()
            , UUID.randomUUID().toString()
            , UUID.randomUUID()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } returns Unit

        val mockedGetAccountByEmailQuery = mockk<Query<String, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns Account(authToken.accountId, "test@mail.net")

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns authToken

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            // Do Nothing
        }
        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            assert(false) // This event should not have happened
        }

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }

        coVerify { mockedGetAccountByEmailQuery.execute(any()) }

        coVerify { mockedLoginGateway.call(any()) }

        EventBus.clear()
    }

    @Test
    fun testShouldSucceedNewAccount() {
        val input = Credentials("test@mail.net", "passwd")
        val authToken = AuthToken(
            UUID.randomUUID().toString()
            , UUID.randomUUID().toString()
            , UUID.randomUUID()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } returns Unit

        val mockedGetAccountByEmailQuery = mockk<Query<String, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns null

        val mockedNewAccountCommand = mockk<Command<Account>>()
        coEvery { mockedNewAccountCommand.execute(any()) } returns Unit

        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns authToken

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            // Do Nothing
        }
        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            assert(false) // This event should not have happened
        }

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }

        coVerify { mockedGetAccountByEmailQuery.execute(any()) }

        coVerify { mockedNewAccountCommand.execute(any()) }

        coVerify { mockedLoginGateway.call(any()) }

        EventBus.clear()
    }

    @Test
    fun testShouldFailNoResult() {
        val input = Credentials("test@mail.net", "passwd")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        val mockedGetAccountByEmailQuery = mockk<Query<String, Account?>>();
        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns null

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            assert(false) // This subscriber should never be triggered
        }
        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            // Do Nothing
        }

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedLoginGateway.call(any()) }

        EventBus.clear()
    }

    @Test
    fun testShouldFailGatewayError() {
        val input = Credentials("test@mail.net", "passwd")
        val authToken = AuthToken(
            UUID.randomUUID().toString()
            , UUID.randomUUID().toString()
            , UUID.randomUUID()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit

        val mockedGetAccountByEmailQuery = mockk<Query<String, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns Account(authToken.accountId, "test@mail.net")

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } throws Exception()

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            assert(false) // This event should not have happened
        }
        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            // Do Nothing
        }

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }

        EventBus.clear()
    }

    @Test
    fun testShouldFailRepositoryError() {
        val input = Credentials("test@mail.net", "passwd")
        val authToken = AuthToken(
            UUID.randomUUID().toString()
            , UUID.randomUUID().toString()
            , UUID.randomUUID()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } throws Exception()

        val mockedGetAccountByEmailQuery = mockk<Query<String, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns Account(authToken.accountId, "test@mail.net")

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns authToken

        EventBus.subscribe(EventType.LOGIN_SUCCESS) {
            assert(false) // This event should not have happened
        }
        EventBus.subscribe(EventType.LOGIN_FAILURE) {
            // Do Nothing
        }

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }

        coVerify { mockedGetAccountByEmailQuery.execute(any()) }

        coVerify { mockedLoginGateway.call(any()) }

        EventBus.clear()
    }
}