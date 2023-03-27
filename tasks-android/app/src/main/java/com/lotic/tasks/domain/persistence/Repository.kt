package com.lotic.tasks.domain.persistence

import kotlinx.coroutines.flow.Flow

interface Repository<I, T> {
    suspend fun insert(entity: T)
    suspend fun update(id: I, entity: T)
    suspend fun getById(id: I): T?
    suspend fun delete(id: I)
}