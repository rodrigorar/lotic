package com.lotic.tasks.domain.modules.tasks.dtos

import java.time.ZonedDateTime
import java.util.UUID

data class Task(
    val id: UUID
    , val title: String
    , val createdAt: ZonedDateTime
    , val updatedAt: ZonedDateTime
    , val ownerId: UUID)
