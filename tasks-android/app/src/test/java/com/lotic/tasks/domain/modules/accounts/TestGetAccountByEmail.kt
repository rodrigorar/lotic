package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.modules.accounts.operations.GetAccountByEmail
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestGetAccountByEmail {

    @Test
    fun testShouldSucceed() {
        val resultAccount = Account(UUID.randomUUID(), "test@mail.net")

        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.getByEmail(any()) } returns resultAccount

        runBlocking {
            val underTest = GetAccountByEmail(mockedAccountsRepository)
            val result = underTest.execute("test@mail.net")

            assert(resultAccount.id == result?.id)
            assert(resultAccount.email == result?.email)
        }

        coVerify { mockedAccountsRepository.getByEmail(any()) }
    }

    @Test
    fun testShouldSucceedNoResult() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.getByEmail(any()) } returns null

        runBlocking {
            val underTest = GetAccountByEmail(mockedAccountsRepository)
            val result = underTest.execute("test@mail.net")

            assert(result == null)
        }

        coVerify { mockedAccountsRepository.getByEmail(any()) }
    }

    @Test
    fun testShouldFailRepositoryError() {
        val resultAccount = Account(UUID.randomUUID(), "test@mail.net")

        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.getByEmail(any()) } throws Exception()

        runBlocking {
            val underTest = GetAccountByEmail(mockedAccountsRepository)
            try {
                underTest.execute("test@mail.net")
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAccountsRepository.getByEmail(any()) }
    }
}