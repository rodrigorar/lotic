package com.lotic.tasks.domain.modules.auth.client

import com.google.gson.annotations.SerializedName
import java.util.*

data class AccountIdRequest(
    @SerializedName("account_id") val accountId: UUID
)
