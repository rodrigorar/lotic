package com.lotic.tasks.domain.modules.auth.operations

import android.annotation.SuppressLint
import android.content.Context
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.persistence.TasksDatabase
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider

object AuthOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var repositoryAuthToken: RepositoryAuthToken
    private lateinit var accountOperationsProvider: AccountsOperationProvider

    override fun setContextProvider(contextProvider: Provider<Context>): AuthOperationsProvider {
        this.contextProvider = contextProvider
        return this;
    }

    fun init(): AuthOperationsProvider {
        // FIXME: This should come from a auth token repo provider instead of being instantiated here
        repositoryAuthToken = RepositoryAuthToken(TasksDatabase.getDatabase(contextProvider.get()).daoAuthToken())
        return this
    }

    fun setAccountOperationsProvider(accountOperationsProvider: AccountsOperationProvider): AuthOperationsProvider {
        if (! this::accountOperationsProvider.isInitialized) {
            this.accountOperationsProvider = accountOperationsProvider
        }
        return this
    }

    fun login(): Login {
        return Login(
            repositoryAuthToken
            , this.accountOperationsProvider.getAccountByEmail()
            , this.accountOperationsProvider.newAccount())
    }

    fun refresh(): Refresh {
        return Refresh(repositoryAuthToken)
    }

    fun logout(): Logout {
        return Logout(repositoryAuthToken, currentActiveAuthSessionProvider())
    }

    fun currentActiveAuthSessionProvider(): CurrentActiveAuthSessionProvider {
        return CurrentActiveAuthSessionProvider(repositoryAuthToken)
    }

    fun clearSessions(): ClearSessions {
        return ClearSessions(repositoryAuthToken)
    }
}