package com.lotic.tasks.domain.modules.accounts.operations

import android.annotation.SuppressLint
import android.content.Context
import com.lotic.tasks.adapters.modules.accounts.gateways.SignUpGateway
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.accounts.AccountsRepository
import com.lotic.tasks.domain.modules.accounts.dto.SignUpDTO
import com.lotic.tasks.domain.shared.operations.Command
import com.lotic.tasks.domain.shared.operations.OperationsProvider
import com.lotic.tasks.domain.shared.operations.Provider
import com.lotic.tasks.domain.shared.operations.Query
import com.lotic.tasks.domain.shared.value_objects.Email

@SuppressLint("StaticFieldLeak")
object AccountsOperationProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var accountsRepository: AccountsRepository

    override fun setContextProvider(contextProvider: Provider<Context>): AccountsOperationProvider {
        this.contextProvider = contextProvider
        return this
    }

    fun init(accountsRepository: AccountsRepository): AccountsOperationProvider {
        // FIXME: This should come from a accounts repo provider instead of being instantiated here
        this.accountsRepository = accountsRepository;
        return this
    }

    fun getAccountByEmail(): Query<Email, Account?> {
        return GetAccountByEmail(this.accountsRepository)
    }

    fun newAccount(): Command<Account> {
        return NewAccount(this.accountsRepository)
    }

    fun signUp(): Command<SignUpDTO> {
        return SignUp(this.accountsRepository, ValidateEmail(), SignUpGateway())
    }
}