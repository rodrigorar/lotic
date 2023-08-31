package com.lotic.tasks.domain.modules.accounts

import com.lotic.tasks.domain.modules.accounts.operations.NewAccount
import com.lotic.tasks.domain.shared.value_objects.Email
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.Test
import java.util.*

class TestNewAccount {

    @Test
    fun shouldSucceed() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.insert(any()) } returns Unit

        val input = Account(Account.newId(), Email.of("test@mail.net"))

        runBlocking {
            val underTest = NewAccount(mockedAccountsRepository)
            underTest.execute(input)
        }

        coVerify { mockedAccountsRepository.insert(any()) }
    }

    @Test
    fun shouldFail_accountsRepositoryError() {
        val mockedAccountsRepository = mockk<AccountsRepository>()
        coEvery { mockedAccountsRepository.insert(any()) } throws Exception("")

        val input = Account(Account.newId(), Email.of("test@mail.net"))

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