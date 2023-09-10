package com.lotic.tasks.adapters.modules.accounts.gateways.payloads

import com.lotic.tasks.domain.modules.accounts.dto.SignUpDTO

class NewAccountRequest(val email: String, val password: String) {

    companion object {
        fun of(signUpDTO: SignUpDTO): NewAccountRequest {
            return NewAccountRequest(signUpDTO.username.value, signUpDTO.password.value)
        }
    }
}