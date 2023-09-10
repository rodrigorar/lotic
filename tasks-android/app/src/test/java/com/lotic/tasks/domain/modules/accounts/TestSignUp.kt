package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.modules.accounts.dto.SignUpDTO
import com.lotic.tasks.domain.modules.accounts.operations.SignUp
import com.lotic.tasks.domain.modules.accounts.operations.ValidateEmail
import com.lotic.tasks.domain.shared.Gateway
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Id
import com.lotic.tasks.domain.shared.value_objects.Password
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test

class TestSignUp {

    @Test
    fun shouldSucceed() {
        val input = SignUpDTO(Email.of("test@mail.not"), Password.of("passwd"))

        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.insert(any()) } returns Unit

        val mockedValidateEmail = mockk<ValidateEmail>()
        coEvery { mockedValidateEmail.execute(any()) } returns true

        val mockedSignUpGateway = mockk<Gateway<SignUpDTO, Id<Account>?>>()
        coEvery { mockedSignUpGateway.call(any()) } returns Account.newId()

        val underTest = SignUp(mockedAccountsRepository, mockedValidateEmail, mockedSignUpGateway)
        runBlocking {
            underTest.execute(input)
        }

        coVerify { mockedAccountsRepository.insert(any()) }
        coVerify { mockedValidateEmail.execute(any()) }
        coVerify { mockedSignUpGateway.call(any()) }
    }

    @Test
    fun shouldFail_invalidEmail() {
        val input = SignUpDTO(Email.of("test@mail.not"), Password.of("passwd"))

        val mockedAccountsRepository = mockk<AccountsRepository>()

        val mockedValidateEmail = mockk<ValidateEmail>()
        coEvery { mockedValidateEmail.execute(any()) } returns false

        val mockedSignUpGateway = mockk<Gateway<SignUpDTO, Id<Account>?>>()

        val underTest = SignUp(mockedAccountsRepository, mockedValidateEmail, mockedSignUpGateway)
        runBlocking {
            try {
                underTest.execute(input)
            } catch(e: java.lang.IllegalArgumentException) {
                // Do Nothing
            }
        }

        coVerify { mockedValidateEmail.execute(any()) }
    }

    @Test
    fun shouldFail_signUpGatewayError() {
        val input = SignUpDTO(Email.of("test@mail.not"), Password.of("passwd"))

        val mockedAccountsRepository = mockk<AccountsRepository>()

        val mockedValidateEmail = mockk<ValidateEmail>()
        coEvery { mockedValidateEmail.execute(any()) } returns true

        val mockedSignUpGateway = mockk<Gateway<SignUpDTO, Id<Account>?>>()
        coEvery { mockedSignUpGateway.call(any()) } throws Exception()

        val underTest = SignUp(mockedAccountsRepository, mockedValidateEmail, mockedSignUpGateway)
        runBlocking {
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedValidateEmail.execute(any()) }
        coVerify { mockedSignUpGateway.call(any()) }
    }

    @Test
    fun shouldFail_accountsRepositoryError() {
        val input = SignUpDTO(Email.of("test@mail.not"), Password.of("passwd"))

        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.insert(any()) } throws Exception()

        val mockedValidateEmail = mockk<ValidateEmail>()
        coEvery { mockedValidateEmail.execute(any()) } returns true

        val mockedSignUpGateway = mockk<Gateway<SignUpDTO, Id<Account>?>>()
        coEvery { mockedSignUpGateway.call(any()) } returns Account.newId()

        val underTest = SignUp(mockedAccountsRepository, mockedValidateEmail, mockedSignUpGateway)
        runBlocking {
            try {
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAccountsRepository.insert(any()) }
        coVerify { mockedValidateEmail.execute(any()) }
        coVerify { mockedSignUpGateway.call(any()) }
    }
}