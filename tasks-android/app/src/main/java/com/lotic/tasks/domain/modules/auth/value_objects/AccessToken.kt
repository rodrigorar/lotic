package com.lotic.tasks.domain.modules.auth.value_objects

import java.util.*

class AccessToken(val value: String) {
    companion object {
        fun of(token: String): AccessToken {
            return AccessToken(token)
        }

        fun new(): AccessToken {
            return AccessToken(UUID.randomUUID().toString())
        }
    }
}