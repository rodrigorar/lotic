package com.lotic.tasks.domain.modules.auth.operations

import android.annotation.SuppressLint
import android.content.Context
import com.lotic.tasks.domain.modules.auth.repositories.RepositoryAuthToken
import com.lotic.tasks.domain.persistence.TasksDatabase

@SuppressLint("StaticFieldLeak")
object AuthOperationsProvider {

    private lateinit var context: Context
    private lateinit var repositoryAuthToken: RepositoryAuthToken

    private fun init() {
        // FIXME: This should come from a auth token repo provider instead of being instantiated here
        repositoryAuthToken = RepositoryAuthToken(TasksDatabase.getDatabase(context).daoAuthToken())
    }

    fun setContext(context: Context) {
        this.context = context
        this.init()
    }

    fun login(): Login {
        return Login(repositoryAuthToken)
    }
}