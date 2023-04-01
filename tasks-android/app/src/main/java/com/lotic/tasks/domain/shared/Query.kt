package com.lotic.tasks.domain.shared

interface Query<K, R> {
    suspend fun execute(parameter: K): R
}