package com.lotic.tasks.domain.events.payloads

import com.lotic.tasks.domain.events.EventInfo
import java.util.UUID

class TaskUpdatedSyncedEventInfo(val taskId: UUID) : EventInfo