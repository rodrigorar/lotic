package com.lotic.tasks.domain.shared.value_objects

data class Position(val value: Int) {

    companion object {

        fun of (position: Int): Position {
            return Position(position)
        }
    }
}
