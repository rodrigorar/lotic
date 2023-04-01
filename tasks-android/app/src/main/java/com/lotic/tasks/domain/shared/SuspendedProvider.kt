package com.lotic.tasks.domain.shared

interface SuspendedProvider<O> {
    suspend fun get(): O
}