package com.lotic.tasks.domain.shared

interface NoInputCommand : Service {
    suspend fun execute()
}