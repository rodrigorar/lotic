package com.lotic.tasks.adapters.modules.auth

import android.content.Context
import com.lotic.tasks.adapters.modules.auth.events.LoginSuccessPublisher
import com.lotic.tasks.adapters.modules.auth.events.LogoutSuccessPublisher
import com.lotic.tasks.domain.modules.accounts.operations.AccountsOperationProvider
import com.lotic.tasks.adapters.modules.auth.gateways.LoginGateway
import com.lotic.tasks.adapters.modules.auth.gateways.LogoutGateway
import com.lotic.tasks.adapters.modules.auth.gateways.RefreshGateway
import com.lotic.tasks.domain.modules.auth.AuthTokenRepository
import com.lotic.tasks.domain.modules.auth.operations.ClearSessions
import com.lotic.tasks.domain.modules.auth.operations.CurrentActiveAuthSessionProvider
import com.lotic.tasks.domain.modules.auth.operations.SignIn
import com.lotic.tasks.domain.modules.auth.operations.SignOut
import com.lotic.tasks.domain.modules.auth.operations.Refresh
import com.lotic.tasks.domain.modules.accounts.operations.ValidateEmail
import com.lotic.tasks.domain.shared.operations.OperationsProvider
import com.lotic.tasks.domain.shared.operations.Provider

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

    fun login(): SignIn {
        return SignIn(
            repositoryAuthToken
            , accountOperationsProvider.getAccountByEmail()
            , accountOperationsProvider.newAccount()
            , ValidateEmail()
            , LoginSuccessPublisher
            , LoginGateway()
        )
    }

    fun refresh(): Refresh {
        return Refresh(repositoryAuthToken, logout(), RefreshGateway())
    }

    fun logout(): SignOut {
        return SignOut(
            repositoryAuthToken
            , currentActiveAuthSessionProvider()
            , LogoutSuccessPublisher
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