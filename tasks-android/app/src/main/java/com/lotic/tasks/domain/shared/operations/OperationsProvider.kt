package com.lotic.tasks.domain.shared.operations

import android.content.Context

interface OperationsProvider {
    fun setContextProvider(contextProvider: Provider<Context>): OperationsProvider
}