package com.lotic.tasks.domain.shared.value_objects

class Email(val value: String) {
    companion object {
        fun of(email: String): Email {
            return Email(email)
        }
    }
}