package com.lotic.tasks.domain.modules.accounts.dto

import com.lotic.tasks.domain.shared.value_objects.Email
import com.lotic.tasks.domain.shared.value_objects.Password

class SignUpDTO(val username: Email, val password: Password)