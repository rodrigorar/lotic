package com.lotic.tasks.domain.shared

interface Provider<O> : Service {
    fun execute(): O
}