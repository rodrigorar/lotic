package com.lotic.tasks.domain.shared

interface Consumer<I> : Service {
    suspend fun execute(input: I)
}