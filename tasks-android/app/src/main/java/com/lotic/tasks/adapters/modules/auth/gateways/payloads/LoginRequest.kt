package com.lotic.tasks.adapters.modules.auth.gateways.payloads

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.domain.modules.auth.Credentials

data class LoginRequest(
    @SerializedName("subject") val subject: String
    , @SerializedName("secret") val secret: String) {

    companion object {
        fun from(credentials: Credentials): LoginRequest {
            return LoginRequest(credentials.subject.value, credentials.secret.value)
        }
    }
}
