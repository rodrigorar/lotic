package com.lotic.tasks.domain.shared

interface Command<I> : Service {
    suspend fun execute(input: I)
}