package com.lotic.tasks.domain.shared

interface ToEntity<E> {
    fun toEntity(): E
}