package com.lotic.tasks.ui

import android.annotation.SuppressLint
import android.util.Log
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
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

@SuppressLint("UnrememberedMutableState")
@Composable
fun MainScreen(
    loginNavigation: () -> Unit
    , signUpNavigation: () -> Unit
    , aboutNavigation: () -> Unit
    , modifier: Modifier = Modifier
    , viewModel: TasksViewModel = viewModel()) {


    val swiperRefreshState = rememberSwipeRefreshState(isRefreshing = viewModel.uiState.isRefreshing)
    val focusRequester = FocusRequester()

    SwipeRefresh(state = swiperRefreshState, onRefresh = { viewModel.refresh() }) {
        Column(modifier = modifier.background(color = MaterialTheme.colors.background)) {
            Row(
                modifier = modifier.fillMaxWidth()
                , horizontalArrangement = Arrangement.End) {
                Box(contentAlignment = Alignment.Center, modifier = modifier) {
                    IconButton(onClick = { viewModel.toggleDropdownMenu() }) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Open options",
                            modifier = modifier.size(30.dp)
                        )
                    }
                    DropdownMenu(
                        expanded = viewModel.uiState.isDropdownMenuExpanded, onDismissRequest = {
                            viewModel.toggleDropdownMenu()
                        }) {

                        DropdownMenuItem(onClick = { aboutNavigation() }) {
                            Text(text = stringResource(R.string.about_btn))
                        }

                        if (! viewModel.uiState.isLoggedIn) {
                            DropdownMenuItem(onClick = { signUpNavigation() }) {
                                Text(text = stringResource(R.string.sign_up_btn))
                            }
                            DropdownMenuItem(onClick = { loginNavigation() }) {
                                Text(text = stringResource(R.string.sign_in_btn))
                            }
                        } else {
                            DropdownMenuItem(onClick = { viewModel.logout() }) {
                                Text(text = stringResource(R.string.logout_btn))
                            }
                        }
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
                // Used instead of LazyColumn because its faster
                Column(modifier = modifier.verticalScroll(rememberScrollState())) {
                    viewModel.uiState.taskList.forEach { task ->
                        Row(
                            horizontalArrangement = Arrangement.SpaceEvenly
                            , modifier = modifier
                                .padding(2.dp)
                        ) {
                            val focusManager = LocalFocusManager.current

                            TextField(
                                value = viewModel.uiState.taskTitles[task.id.value].orEmpty()
                                , onValueChange = {
                                    viewModel.updateTaskTitle(task, it)
                                }
                                , singleLine = true
                                , keyboardOptions = KeyboardOptions(autoCorrect = true, imeAction = ImeAction.Done)
                                , keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() })
                                , colors = TextFieldDefaults.textFieldColors(
                                    backgroundColor = MaterialTheme.colors.background
                                    , textColor = MaterialTheme.colors.onBackground
                                    , unfocusedIndicatorColor = Color.Transparent)
                                , modifier = modifier
                                    .weight(5f)
                                    .wrapContentWidth(align = Alignment.Start, unbounded = false)
                                    .focusRequester(focusRequester))

                            Checkbox(
                                checked = viewModel.uiState.taskCheckboxes[task.id.value] ?: false
                                , colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colors.primary)
                                , onCheckedChange = { viewModel.toggleComplete(task) }
                                , modifier = modifier
                                    .weight(1f)
                                    .wrapContentWidth(Alignment.End))

                            if (viewModel.uiState.taskTitles[task.id.value] == "") {
                                LaunchedEffect(Unit) {
                                    focusRequester.requestFocus()
                                }
                            }
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
                        onClick = { viewModel.createNewTask() }
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
}