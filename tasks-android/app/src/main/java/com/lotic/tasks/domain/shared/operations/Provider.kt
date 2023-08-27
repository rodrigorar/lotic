package com.lotic.tasks.domain.shared.operations

fun interface Provider<O> {
    fun get(): O
}