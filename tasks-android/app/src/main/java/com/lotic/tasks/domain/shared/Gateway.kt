package com.lotic.tasks.domain.shared

interface Gateway<I, O> {
    suspend fun call(payload: I) : O
}