package com.lotic.tasks.domain.shared.operations

interface NoInputCommand {
    suspend fun execute()
}