package com.lotic.tasks.domain.shared

interface NoInputCommand {
    suspend fun execute()
}