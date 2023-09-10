package com.lotic.tasks.adapters.modules.accounts.gateways

import com.lotic.tasks.adapters.modules.accounts.gateways.payloads.NewAccountRequest
import com.lotic.tasks.domain.modules.accounts.Account
import com.lotic.tasks.domain.modules.accounts.dto.SignUpDTO
import com.lotic.tasks.domain.shared.value_objects.Id

class SignUpGateway : RetrofitAccountsGateway<SignUpDTO, Id<Account>?>() {

    override suspend fun call(payload: SignUpDTO): Id<Account>? {
        return this.accountsClient
            ?.newAccount(NewAccountRequest.of(payload))
            ?.toDTO()
    }

}