package com.lotic.tasks.domain.shared

interface FromEntity<D, E> {
    fun fromEntity(entity: E): D
}