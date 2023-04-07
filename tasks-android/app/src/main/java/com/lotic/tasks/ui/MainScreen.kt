package com.lotic.tasks.ui

import android.util.Log
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lotic.tasks.R
import com.lotic.tasks.ui.shared.SharedViewModel

fun doLoginOrLogout(
    viewModel: TasksViewModel
    , sharedViewModel: SharedViewModel
    , loginNavigation: () -> Unit) {

    if (! sharedViewModel.uiState.isLoggedIn) {
        loginNavigation()
    } else {
        sharedViewModel.logout()
    }
}

@Composable
fun MainScreen(
    loginNavigation: () -> Unit
    , modifier: Modifier = Modifier
    , sharedViewModel: SharedViewModel = SharedViewModel
    , viewModel: TasksViewModel = viewModel()) {

    // FIXME: This needs to be removed, the UI should be updated everytime the synch manager runs
    sharedViewModel.getTaskList()

    Column {
        Row(
            modifier = modifier.fillMaxWidth()
            , horizontalArrangement = Arrangement.End) {
            OutlinedButton(
                // FIXME: This should be called on the login screen
                onClick = { doLoginOrLogout(viewModel, sharedViewModel, loginNavigation) }
                , shape = MaterialTheme.shapes.medium
                , colors = ButtonDefaults.buttonColors(
                    backgroundColor = MaterialTheme.colors.primary)
                , modifier = modifier.padding(15.dp)
            ) {
                if (sharedViewModel.uiState.isLoggedIn) Text(text = stringResource(R.string.logout_btn))
                else Text(text = stringResource(R.string.login_btn))
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
            .padding(2.dp)) {
            LazyColumn {
                items(sharedViewModel.uiState.taskList) {task ->
                    Row(
                        horizontalArrangement = Arrangement.SpaceEvenly
                        , modifier = modifier
                            .padding(2.dp)) {
                        TextField(
                            value = task.title
                            , onValueChange = { /* TODO  */ }
                            , modifier = modifier
                                .width(320.dp)
                                .wrapContentWidth(align = Alignment.Start, unbounded = false)
                                .horizontalScroll(rememberScrollState()))
                        var checkedState by remember { mutableStateOf(false) }
                        Checkbox(
                            checked = checkedState
                            , colors = CheckboxDefaults.colors(uncheckedColor = Color.Black)
                            , onCheckedChange = {
                                checkedState = it
                                Log.d("MainScreen", "Updating the checkbox state")
                                if (it) {
                                    sharedViewModel.markComplete(task.id)
                                }
                            }
                        , modifier = modifier
                                .wrapContentWidth(Alignment.End))
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
                        .size(250.dp, 250.dp)
                        .padding(15.dp)) {

                    Icon(Icons.Default.Add, contentDescription = "Add tasks", tint = MaterialTheme.colors.secondary)
                }
            }
        }
    }
}