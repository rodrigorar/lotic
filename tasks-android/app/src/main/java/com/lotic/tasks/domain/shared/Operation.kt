package com.lotic.tasks.domain.shared

interface Operation<I, O> : Service {
    suspend fun execute(input: I): O
}