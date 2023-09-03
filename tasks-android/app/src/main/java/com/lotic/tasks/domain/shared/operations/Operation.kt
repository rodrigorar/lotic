package com.lotic.tasks.domain.shared.operations

interface Operation<I, O> {
    fun execute(input: I): O
}