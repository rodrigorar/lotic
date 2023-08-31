package com.lotic.tasks.domain.shared

interface Repository<I, T> {
    suspend fun insert(entity: T)
    suspend fun update(entity: T)
    suspend fun getById(id: I): T?
    suspend fun delete(id: I)
}