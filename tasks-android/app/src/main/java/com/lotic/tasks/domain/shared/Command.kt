package com.lotic.tasks.domain.shared

interface Command<I> {
    suspend fun execute(input: I)
}