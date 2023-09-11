package com.lotic.tasks.ui.screens.about

import androidx.compose.animation.expandHorizontally
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.lotic.tasks.BuildConfig
import com.lotic.tasks.R

@Composable
fun AboutScreen(modifier: Modifier = Modifier) {

    Column(
        horizontalAlignment = Alignment.CenterHorizontally
        , verticalArrangement = Arrangement.Center
        , modifier = modifier.fillMaxHeight().fillMaxWidth()) {

        Text(
            text = stringResource(R.string.lotic)
            , fontSize = MaterialTheme.typography.subtitle1.fontSize
            , color = MaterialTheme.colors.primary)

        Spacer(modifier = modifier.size(150.dp))

        Text(
            text = stringResource(R.string.tasks)
            , fontSize = MaterialTheme.typography.h2.fontSize
            , color = MaterialTheme.colors.primary)

        Spacer(modifier = modifier.size(20.dp))

        Text(
            text = stringResource(R.string.tasks_description)
            , fontSize = MaterialTheme.typography.h5.fontSize)

        Spacer(modifier = modifier.size(50.dp))

        Text(
            text = BuildConfig.VERSION_NAME
            , fontSize = MaterialTheme.typography.h4.fontSize
            , color = MaterialTheme.colors.primary)

        Spacer(modifier = modifier.size(300.dp))

        Text(
            text = stringResource(R.string.copyright)
            , fontSize = MaterialTheme.typography.h6.fontSize)
    }
}