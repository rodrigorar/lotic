package com.lotic.tasks.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lotic.tasks.R
import com.lotic.tasks.ui.theme.TasksTheme

@Composable
fun MainScreen(modifier: Modifier = Modifier, viewModel: TasksViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Column {
        Row(
            modifier = modifier.fillMaxWidth()
            , horizontalArrangement = Arrangement.End) {
            OutlinedButton(
                onClick = { /* TODO */ }
                , shape = RoundedCornerShape(25)
                , colors = ButtonDefaults.buttonColors(
                    backgroundColor = MaterialTheme.colors.secondary)
                , modifier = modifier.padding(15.dp)
            ) {
                Text(text = stringResource(R.string.login_btn))
            }
        }
        Row(modifier = modifier
            .fillMaxWidth()
            .padding(6.dp)) {
            Text(
                text = stringResource(R.string.upcoming_title)
                , fontWeight = FontWeight.Bold
                , fontSize = 24.sp
            )
        }
        Box(modifier = modifier
            .fillMaxWidth()
            .padding(2.dp)) {
            LazyColumn {
                items(uiState.taskList) {task ->
                    Row(
                        horizontalArrangement = Arrangement.SpaceEvenly
                        , modifier = modifier.fillMaxWidth()) {
                        TextField(
                            value = task.title
                            , colors = TextFieldDefaults.textFieldColors(backgroundColor = MaterialTheme.colors.background)
                            , onValueChange = { /* TODO  */ })
                        Checkbox(
                            checked = false
                            , onCheckedChange = { /* TODO */ })
                    }
                }
            }
            Row(
                verticalAlignment = Alignment.Bottom
                , horizontalArrangement = Arrangement.End
                , modifier = modifier.fillMaxSize()) {
            IconButton(
                onClick = { /*TODO*/ }
                , modifier = Modifier
                    .clip(CircleShape)
                    .size(100.dp, 100.dp)
                    .padding(15.dp)) {

                Icon(Icons.Default.Add, contentDescription = "Add tasks", tint = MaterialTheme.colors.secondary)
            }
            }
        }
    }
}

@Preview
@Composable
fun MainScreenPreview() {
    TasksTheme {
        MainScreen()
    }
}