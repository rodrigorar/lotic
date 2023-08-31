package com.lotic.tasks.domain.modules.auth.value_objects

import java.util.*

class RefreshToken(val value: String) {
    companion object {
        fun of(refreshToken: String): RefreshToken {
            return RefreshToken(refreshToken)
        }

        fun new(): RefreshToken {
            return RefreshToken(UUID.randomUUID().toString())
        }
    }
}