package com.lotic.tasks.ui.components

import androidx.compose.foundation.layout.padding
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedButton
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ActionButtonComponent(
    onClick: () -> Unit
    , buttonText: String
    , modifier: Modifier = Modifier
    , enabled: Boolean = true) {

    OutlinedButton(
        onClick = onClick
        , shape = MaterialTheme.shapes.medium
        , colors = ButtonDefaults.buttonColors(
            backgroundColor = MaterialTheme.colors.primary)
        , enabled = enabled
        , modifier = modifier.padding(15.dp)
    ) {
        Text(text = buttonText)
    }
}