package com.lotic.tasks.domain.shared.operations

interface Query<K, R> {
    suspend fun execute(parameter: K): R
}