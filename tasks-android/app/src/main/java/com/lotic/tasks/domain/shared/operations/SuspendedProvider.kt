package com.lotic.tasks.domain.shared.operations

interface SuspendedProvider<O> {
    suspend fun get(): O
}