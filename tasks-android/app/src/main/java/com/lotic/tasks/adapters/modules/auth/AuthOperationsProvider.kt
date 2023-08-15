package com.lotic.tasks.adapters.modules.auth

import android.content.Context
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.adapters.modules.auth.gateways.LoginGateway
import com.lotic.tasks.adapters.modules.auth.gateways.LogoutGateway
import com.lotic.tasks.adapters.modules.auth.gateways.RefreshGateway
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.operations.ClearSessions
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.auth.operations.Login
import com.lotic.tasks.domain.modules.auth.operations.Logout
import com.lotic.tasks.domain.modules.auth.operations.Refresh
import com.lotic.tasks.domain.shared.OperationsProvider
import com.lotic.tasks.domain.shared.Provider

object AuthOperationsProvider : OperationsProvider {

    private lateinit var contextProvider: Provider<Context>
    private lateinit var repositoryAuthToken: AuthTokenRepository
    private lateinit var accountOperationsProvider: AccountsOperationProvider

    override fun setContextProvider(contextProvider: Provider<Context>): AuthOperationsProvider {
        AuthOperationsProvider.contextProvider = contextProvider
        return this;
    }

    fun init(authTokenRepository: AuthTokenRepository): AuthOperationsProvider {
        repositoryAuthToken = authTokenRepository
        return this
    }

    fun setAccountOperationsProvider(accountOperationsProvider: AccountsOperationProvider): AuthOperationsProvider {
        if (! this::accountOperationsProvider.isInitialized) {
            AuthOperationsProvider.accountOperationsProvider = accountOperationsProvider
        }
        return this
    }

    fun login(): Login {
        return Login(
            repositoryAuthToken
            , accountOperationsProvider.getAccountByEmail()
            , accountOperationsProvider.newAccount()
            , LoginGateway()
        )
    }

    fun refresh(): Refresh {
        return Refresh(repositoryAuthToken, RefreshGateway())
    }

    fun logout(): Logout {
        return Logout(
            repositoryAuthToken
            , currentActiveAuthSessionProvider()
            , LogoutGateway()
        )
    }

    fun currentActiveAuthSessionProvider(): CurrentActiveAuthSessionProvider {
        return CurrentActiveAuthSessionProvider(repositoryAuthToken)
    }

    fun clearSessions(): ClearSessions {
        return ClearSessions(repositoryAuthToken)
    }
}