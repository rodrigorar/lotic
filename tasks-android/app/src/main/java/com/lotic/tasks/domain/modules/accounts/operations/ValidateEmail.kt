package com.lotic.tasks.domain.modules.accounts.operations

import com.lotic.tasks.domain.shared.operations.Operation
import com.lotic.tasks.domain.shared.value_objects.Email
import java.util.regex.Pattern

class ValidateEmail : Operation<Email, Boolean> {
    private val EMAIL_REGEX = Pattern.compile("[a-zA-Z\\d][a-zA-Z\\d-._+]{0,61}[a-zA-Z\\d]@[a-zA-Z\\d-.]*.[a-z]*")

    override fun execute(input: Email): Boolean {
        return EMAIL_REGEX.matcher(input.value).matches()
    }
}