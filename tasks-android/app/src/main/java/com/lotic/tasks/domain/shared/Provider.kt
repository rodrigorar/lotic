package com.lotic.tasks.domain.shared

fun interface Provider<O> : Service {
    fun get(): O
}