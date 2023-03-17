package com.lotic.tasks.domain.shared

interface Operation<I, O> : Service {
    fun execute(input: I): O
}