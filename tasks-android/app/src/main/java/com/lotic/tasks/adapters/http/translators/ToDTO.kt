package com.lotic.tasks.adapters.http.translators

interface ToDTO<D> {
    fun toDTO(): D
}