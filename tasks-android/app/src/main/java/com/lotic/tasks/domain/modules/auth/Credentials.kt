package com.lotic.tasks.domain.modules.auth

import com.google.gson.annotations.SerializedName
import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password

data class Credentials(
    @SerializedName("subject") val subject: Email
    , @SerializedName("secret") val secret: Password
)