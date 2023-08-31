package com.lotic.tasks.domain.shared.value_objects

class Description(val value: String) {
    companion object {
        fun of(description: String): Description {
            return Description(description)
        }
    }
}