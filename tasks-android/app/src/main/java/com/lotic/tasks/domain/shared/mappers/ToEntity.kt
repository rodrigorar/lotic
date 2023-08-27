package com.lotic.tasks.domain.shared.mappers

interface ToEntity<E> {
    fun toEntity(): E
}