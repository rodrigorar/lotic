package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.modules.accounts.operations.GetAccountByEmail
import com.lotic.tasks.domain.shared.value_objects.Email
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestGetAccountByEmail {

    @Test
    fun shouldSucceed() {
        val testEmail = Email.of("test@mail.net")
        val resultAccount = Account(Account.newId(), testEmail)

        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.getByEmail(any()) } returns resultAccount

        runBlocking {
            val underTest = GetAccountByEmail(mockedAccountsRepository)
            val result = underTest.execute(testEmail)

            assert(resultAccount.id == result?.id)
            assert(resultAccount.email == result?.email)
        }

        coVerify { mockedAccountsRepository.getByEmail(any()) }
    }

    @Test
    fun shouldSucceed_noResult() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.getByEmail(any()) } returns null

        runBlocking {
            val underTest = GetAccountByEmail(mockedAccountsRepository)
            val result = underTest.execute(Email.of("test@mail.net"))

            assert(result == null)
        }

        coVerify { mockedAccountsRepository.getByEmail(any()) }
    }

    @Test
    fun testShouldFailRepositoryError() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.getByEmail(any()) } throws Exception()

        runBlocking {
            val underTest = GetAccountByEmail(mockedAccountsRepository)
            try {
                underTest.execute(Email.of("test@mail.net"))
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAccountsRepository.getByEmail(any()) }
    }
}