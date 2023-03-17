package com.lotic.tasks.domain.shared

interface Consumer<I> : Service {
    fun execute(input: I)
}