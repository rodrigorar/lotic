package com.lotic.tasks.domain.modules.accounts.operations

import android.annotation.SuppressLint
import android.content.Context
import com.lotic.tasks.domain.modules.accounts.dto.Account
import com.lotic.tasks.domain.modules.accounts.repositories.AccountsRepository
import com.lotic.tasks.domain.persistence.TasksDatabase
import com.lotic.tasks.domain.shared.Command
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider
import com.lotic.tasks.domain.shared.Query

@SuppressLint("StaticFieldLeak")
object AccountsOperationProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var accountsRepository: AccountsRepository

    override fun setContextProvider(contextProvider: Provider<Context>): AccountsOperationProvider {
        this.contextProvider = contextProvider
        return this
    }

    fun init(): AccountsOperationProvider {
        // FIXME: This should come from a accounts repo provider instead of being instantiated here
        this.accountsRepository = AccountsRepository(
            TasksDatabase.getDatabase(AccountsOperationProvider.contextProvider.get()).daoAccounts()
        )
        return this
    }

    fun getAccountByEmail(): Query<String, Account?> {
        return GetAccountByEmail(this.accountsRepository)
    }

    fun newAccount(): Command<Account> {
        return NewAccount(this.accountsRepository)
    }
}