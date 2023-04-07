package com.lotic.tasks.ui

import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lotic.tasks.R

fun doLoginOrLogout(
    viewModel: TasksViewModel
    , loginNavigation: () -> Unit) {

    if (! viewModel.uiState.isLoggedIn) {
        loginNavigation()
    } else {
        viewModel.logout()
    }
}

@Composable
fun MainScreen(
    loginNavigation: () -> Unit
    , modifier: Modifier = Modifier
    , viewModel: TasksViewModel = viewModel()) {
    
    Column(modifier = modifier.background(color = MaterialTheme.colors.background)) {
        Row(
            modifier = modifier.fillMaxWidth()
            , horizontalArrangement = Arrangement.End) {
            OutlinedButton(
                // FIXME: This should be called on the login screen
                onClick = { doLoginOrLogout(viewModel, loginNavigation) }
                , shape = MaterialTheme.shapes.medium
                , colors = ButtonDefaults.buttonColors(
                    backgroundColor = MaterialTheme.colors.primary)
                , modifier = modifier.padding(15.dp)
            ) {
                if (viewModel.uiState.isLoggedIn) {
                    Log.d("MainScreen", "Is logged in")
                    Text(text = stringResource(R.string.logout_btn))
                }
                else {
                    Log.d("MainScreen", "Is not logged in")
                    Text(text = stringResource(R.string.login_btn))
                }
            }
        }
        Row(modifier = modifier
            .fillMaxWidth()
            .padding(top = 20.dp, start = 40.dp, bottom = 15.dp)) {
            Text(
                text = stringResource(R.string.upcoming_title)
                , fontWeight = FontWeight.Bold
                , color = MaterialTheme.colors.secondary
                , fontSize = 24.sp
            )
        }

        Divider(
            color = MaterialTheme.colors.onBackground
            , thickness = 1.dp
            , startIndent = 10.dp
            , modifier = modifier
                .padding(bottom = 10.dp)
                .width(300.dp))

        Box(modifier = modifier
            .padding(2.dp)) {
            LazyColumn {

                items(viewModel.uiState.taskList) { task ->
                    Row(
                        horizontalArrangement = Arrangement.SpaceEvenly
                        , modifier = modifier
                            .padding(2.dp)
                    ) {
                        TextField(
                            value = task.title
                            , onValueChange = { /* TODO  */ }
                            , singleLine = true
                            , colors = TextFieldDefaults.textFieldColors(
                                backgroundColor = MaterialTheme.colors.background
                                , unfocusedIndicatorColor = Color.Transparent)
                            , modifier = modifier
                                .weight(5f)
                                .wrapContentWidth(align = Alignment.Start, unbounded = false)
                                .horizontalScroll(rememberScrollState()))
                        var checkedState by remember { mutableStateOf(false) }
                        Checkbox(
                            checked = checkedState,
                            colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colors.primary),
                            onCheckedChange = {
                                checkedState = it
                                if (it) {
                                    viewModel.markComplete(task.id)
                                }
                            },
                            modifier = modifier
                                .weight(1f)
                                .wrapContentWidth(Alignment.End))
                    }
                }
            }
            Row(
                verticalAlignment = Alignment.Bottom
                , horizontalArrangement = Arrangement.End
                , modifier = modifier
                    .fillMaxSize()
                    .padding(end = 20.dp, bottom = 20.dp)) {

                OutlinedButton(
                    onClick = { /*TODO*/ }
                    , shape = CircleShape
                    , border = BorderStroke(1.dp, MaterialTheme.colors.primary)
                    , colors = ButtonDefaults.outlinedButtonColors(backgroundColor = MaterialTheme.colors.background)
                    , modifier = Modifier
                        .size(100.dp, 100.dp)
                        .padding(15.dp)) {

                    Icon(
                        Icons.Default.Add
                        , contentDescription = "Add tasks"
                        , modifier = modifier
                            .size(80.dp, 80.dp))
                }
            }
        }
    }
}