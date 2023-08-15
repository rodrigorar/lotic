package com.lotic.tasks.adapters.http.translators

interface FromDTO<D, R> {
    fun fromDTO(dto: D): R
}