package com.lotic.tasks.domain.modules.tasks.events

import com.lotic.tasks.domain.modules.auth.AuthToken
import com.lotic.tasks.domain.modules.tasks.SyncManager
import com.lotic.tasks.domain.shared.events.Event
import com.lotic.tasks.domain.shared.events.Subscriber

class SignInSuccessSubscriber : Subscriber<AuthToken>() {

    override fun notify(event: Event<AuthToken>) {
        SyncManager.execute()
    }
}