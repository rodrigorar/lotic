package com.lotic.tasks.domain.shared.value_objects

class Title(val value: String) {
    companion object {
        fun of(title: String): Title {
            return Title(title)
        }
    }
}