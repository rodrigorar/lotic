package com.lotic.tasks.domain.events.payloads

import com.lotic.tasks.domain.events.EventInfo
import java.util.UUID

class TasksSyncedEventInfo(
    val createdTaskIds: List<UUID>
    , val deletedTaskIds: List<UUID>) : EventInfo {
}