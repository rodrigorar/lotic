package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.modules.accounts.operations.NewAccount
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestNewAccount {

    @Test
    fun testShouldSucceed() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.insert(any()) } returns Unit

        val input = Account(UUID.randomUUID(), "test@mail.net")

        runBlocking {
            val underTest = NewAccount(mockedAccountsRepository)
            underTest.execute(input)
        }

        coVerify { mockedAccountsRepository.insert(any()) }
    }

    @Test
    fun testShouldFailAccountsRepositoryError() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.insert(any()) } throws Exception("")

        val input = Account(UUID.randomUUID(), "test@mail.net")

        runBlocking {
            try {
                val underTest = NewAccount(mockedAccountsRepository)
                underTest.execute(input)
            } catch (e: Exception) {
                // Do Nothing
            }
        }

        coVerify { mockedAccountsRepository.insert(any()) }
    }
}