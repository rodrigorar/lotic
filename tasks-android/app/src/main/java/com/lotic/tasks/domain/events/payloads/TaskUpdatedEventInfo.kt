package com.lotic.tasks.domain.events.payloads

import com.lotic.tasks.domain.events.EventInfo
import java.util.UUID

data class TaskUpdatedEventInfo(val taskId: UUID) : EventInfo
