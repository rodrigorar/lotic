package com.lotic.tasks.domain.http.translators

interface ToDTO<D> {
    fun toDTO(): D
}