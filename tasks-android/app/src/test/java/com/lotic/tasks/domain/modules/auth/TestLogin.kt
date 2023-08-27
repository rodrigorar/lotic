package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.operations.Login
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Query
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
    fun shouldSucceedNoNewAccount() {
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

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()
        coEvery { mockedLoginSuccessPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
        coVerify { mockedLoginSuccessPublisher.publish(any()) }
    }

    @Test
    fun shouldSucceed_newAccount() {
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

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()
        coEvery { mockedLoginSuccessPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedNewAccountCommand.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
        coVerify { mockedLoginSuccessPublisher.publish(any()) }
    }

    @Test
    fun shouldFail_noResult() {
        val input = Credentials("test@mail.net", "passwd")

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        val mockedGetAccountByEmailQuery = mockk<Query<String, Account?>>();
        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns null

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedLoginGateway.call(any()) }
    }

    @Test
    fun shouldFail_gatewayError() {
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

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
    }

    @Test
    fun shouldFail_repositoryError() {
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

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = Login(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
    }
}