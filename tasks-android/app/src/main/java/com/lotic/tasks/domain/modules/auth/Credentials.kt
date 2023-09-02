package com.lotic.tasks.domain.modules.auth

import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password

data class Credentials(val subject: Email, val secret: Password)