package com.lotic.tasks.domain.shared

import android.content.Context

interface OperationsProvider {
    fun setContextProvider(contextProvider: Provider<Context>): OperationsProvider
}