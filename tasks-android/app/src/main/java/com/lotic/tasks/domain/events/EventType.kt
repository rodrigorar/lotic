package com.lotic.tasks.domain.events

enum class EventType {
    LOGIN_SUCCESS
    , LOGIN_FAILURE
    , LOGOUT_SUCCESS
    , LOGOUT_FAILURE
    , SYNC_SUCCESS
    , SYNC_FAILURE
    , TASKS_UPDATED
    , TASKS_UPDATED_SYNCED
    , TASKS_CREATED
    , TASKS_CREATED_SYNCED
    , TASKS_COMPLETED
}