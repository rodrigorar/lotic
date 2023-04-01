package com.lotic.tasks.domain.http.translators

interface FromDTO<D, R> {
    fun fromDTO(dto: D): R
}