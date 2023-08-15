package com.lotic.tasks.domain.shared

fun interface Provider<O> {
    fun get(): O
}