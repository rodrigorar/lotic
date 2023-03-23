package com.lotic.tasks.domain.modules.auth.dto

import com.google.gson.annotations.SerializedName

data class Credentials(
    @SerializedName("subject") val subject: String
    , @SerializedName("secret") val secret: String)