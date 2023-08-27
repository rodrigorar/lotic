package com.lotic.tasks.domain.shared.mappers

interface FromEntity<D, E> {
    fun fromEntity(entity: E): D
}