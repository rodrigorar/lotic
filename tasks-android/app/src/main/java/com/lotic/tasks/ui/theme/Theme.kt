package com.lotic.tasks.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorPalette = darkColors(
    primary = LightBlue400
    , onPrimary = White
    , primaryVariant = LightBlue50
    , secondary = Teal200
    , onSecondary = White
    , secondaryVariant = Color.Cyan
    , background = Color.Black
    , onBackground = Color.DarkGray
    , surface = Color.Black
)

private val LightColorPalette = lightColors(
    primary = LightBlue400
    , onPrimary = Black
    , primaryVariant = LightBlue50
    , secondary = Color.DarkGray
    , onSecondary = White
    , secondaryVariant = Color.LightGray
    , background = White
    , surface = White
)

@Composable
fun TasksTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val colors = if (darkTheme) {
        DarkColorPalette
    } else {
        LightColorPalette
    }

    MaterialTheme(
        colors = colors,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}