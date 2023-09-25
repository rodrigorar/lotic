package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.auth.operations.SignIn
import com.lotic.tasks.domain.modules.auth.value_objects.AccessToken
import com.lotic.tasks.domain.modules.auth.value_objects.RefreshToken
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.events.Publisher
import com.lotic.tasks.domain.shared.operations.Operation
import com.lotic.tasks.domain.shared.operations.Query
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password
import io.mockk.InternalPlatformDsl.toStr
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.time.Instant

class TestLogin {
    val EMAIL = Email.of("test@mail.net")
    val PASSWORD = Password.of("passwd")

    @Test
    fun shouldSucceedNoNewAccount() {
        val input = Credentials(EMAIL, PASSWORD)
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } returns Unit

        val mockedGetAccountByEmailQuery = mockk<Query<Email, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns Account(authToken.accountId, EMAIL)

        val mockedEmailValidate = mockk<Operation<Email, Boolean>>()
        coEvery { mockedEmailValidate.execute(any()) } returns true

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns authToken

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()
        coEvery { mockedLoginSuccessPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = SignIn(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedEmailValidate
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedEmailValidate.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
        coVerify { mockedLoginSuccessPublisher.publish(any()) }
    }

    @Test
    fun shouldSucceed_newAccount() {
        val input = Credentials(EMAIL, PASSWORD)
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } returns Unit

        val mockedGetAccountByEmailQuery = mockk<Query<Email, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns null

        val mockedNewAccountCommand = mockk<Command<Account>>()
        coEvery { mockedNewAccountCommand.execute(any()) } returns Unit

        val mockedEmailValidate = mockk<Operation<Email, Boolean>>()
        coEvery { mockedEmailValidate.execute(any()) } returns true

        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns authToken

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()
        coEvery { mockedLoginSuccessPublisher.publish(any()) } returns Unit

        runBlocking {
            val underTest = SignIn(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedEmailValidate
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedNewAccountCommand.execute(any()) }
        coVerify { mockedEmailValidate.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
        coVerify { mockedLoginSuccessPublisher.publish(any()) }
    }

    @Test
    fun shouldFail_noResult() {
        val input = Credentials(EMAIL, PASSWORD)

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        val mockedGetAccountByEmailQuery = mockk<Query<Email, Account?>>();
        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedEmailValidate = mockk<Operation<Email, Boolean>>()
        coEvery { mockedEmailValidate.execute(any()) } returns true
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns null

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = SignIn(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedEmailValidate
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedLoginGateway.call(any()) }
        coVerify { mockedEmailValidate.execute(any()) }
    }

    @Test
    fun shouldFail_gatewayError() {
        val input = Credentials(EMAIL, PASSWORD)
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit

        val mockedGetAccountByEmailQuery = mockk<Query<Email, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns Account(authToken.accountId, EMAIL)

        val mockedEmailValidate = mockk<Operation<Email, Boolean>>()
        coEvery { mockedEmailValidate.execute(any()) } returns true

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } throws Exception()

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = SignIn(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedEmailValidate
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedEmailValidate.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
    }

    @Test
    fun shouldFail_repositoryError() {
        val input = Credentials(EMAIL, PASSWORD)
        val authToken = AuthToken(
            AccessToken.new()
            , RefreshToken.new()
            , Account.newId()
            , Instant.now().toStr())

        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        coEvery { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) } returns Unit
        coEvery { mockedAuthTokenRepository.insert(any()) } throws Exception()

        val mockedGetAccountByEmailQuery = mockk<Query<Email, Account?>>();
        coEvery { mockedGetAccountByEmailQuery.execute(any()) } returns Account(authToken.accountId, EMAIL)

        val mockedEmailValidate = mockk<Operation<Email, Boolean>>()
        coEvery { mockedEmailValidate.execute(any()) } returns true

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        coEvery { mockedLoginGateway.call(any()) } returns authToken

        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = SignIn(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedEmailValidate
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            underTest.execute(input)
        }

        coVerify { mockedAuthTokenRepository.deleteAllForAccount(authToken.accountId) }
        coVerify { mockedAuthTokenRepository.insert(any()) }
        coVerify { mockedGetAccountByEmailQuery.execute(any()) }
        coVerify { mockedEmailValidate.execute(any()) }
        coVerify { mockedLoginGateway.call(any()) }
    }

    @Test
    fun shouldFail_invalidEmail() {
        val input = Credentials(EMAIL, PASSWORD)
        val mockedAuthTokenRepository = mockk<AuthTokenRepository>();
        val mockedGetAccountByEmailQuery = mockk<Query<Email, Account?>>();

        val mockedEmailValidate = mockk<Operation<Email, Boolean>>()
        coEvery { mockedEmailValidate.execute(any()) } returns false

        val mockedNewAccountCommand = mockk<Command<Account>>();
        val mockedLoginGateway = mockk<Gateway<Credentials, AuthToken?>>();
        val mockedLoginSuccessPublisher = mockk<Publisher<AuthToken>>()

        runBlocking {
            val underTest = SignIn(
                mockedAuthTokenRepository
                , mockedGetAccountByEmailQuery
                , mockedNewAccountCommand
                , mockedEmailValidate
                , mockedLoginSuccessPublisher
                , mockedLoginGateway)
            try {
                underTest.execute(input)
            } catch (e: IllegalArgumentException) {
                // Do nothing
            }
        }

        coVerify { mockedEmailValidate.execute(any()) }
    }
}