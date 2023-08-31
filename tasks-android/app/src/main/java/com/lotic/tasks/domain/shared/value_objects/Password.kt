package com.lotic.tasks.domain.shared.value_objects

class Password(val value: String) {
    companion object {
        fun of(password: String): Password {
            return Password(password)
        }
    }
}