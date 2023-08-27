package com.lotic.tasks.domain.shared.operations

interface Command<I> {
    suspend fun execute(input: I)
}