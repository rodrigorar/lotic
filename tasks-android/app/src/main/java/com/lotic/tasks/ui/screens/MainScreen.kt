package com.lotic.tasks.ui.screens

import android.annotation.SuppressLint
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import com.lotic.tasks.R
import com.lotic.tasks.ui.TasksViewModel
import com.lotic.tasks.ui.components.DropdownMenuComponent
import com.lotic.tasks.ui.components.TaskComponent
import org.burnoutcrew.reorderable.ReorderableItem
import org.burnoutcrew.reorderable.detectReorderAfterLongPress
import org.burnoutcrew.reorderable.rememberReorderableLazyListState
import org.burnoutcrew.reorderable.reorderable

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
                DropdownMenuComponent(
                    toggleDropdownMenu = { viewModel.toggleDropdownMenu() },
                    isDropdownMenuExpanded = viewModel.uiState.isDropdownMenuExpanded,
                    isAccountLoggedIn = viewModel.uiState.isLoggedIn,
                    aboutNavigation = aboutNavigation,
                    signUpNavigation = signUpNavigation,
                    signInNavigation = loginNavigation,
                    logout = { viewModel.logout() })
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

            Box(modifier = modifier.padding(2.dp)) {
                val lazyListState = rememberReorderableLazyListState(onMove = { from, to ->
                    viewModel.reorderTask(from.index, to.index)
                });

                LazyColumn(
                    state = lazyListState.listState
                    , modifier = Modifier
                        .reorderable(lazyListState)
                        .detectReorderAfterLongPress(lazyListState)) {
                    items(viewModel.uiState.taskList) {item ->
                        ReorderableItem(lazyListState, key = item) { isDragging ->
                            val elevation = animateDpAsState(if (isDragging) 16.dp else 0.dp)
                            TaskComponent(
                                item
                                , viewModel.uiState.taskTitles[item.id.value].orEmpty()
                                , { newTitle -> viewModel.updateTaskTitle(item, newTitle) }
                                , viewModel.uiState.taskCheckboxes[item.id.value] ?: false
                                , { taskData -> viewModel.toggleComplete(taskData) }
                                , focusRequester
                                , modifier = Modifier.shadow(elevation.value)
                            )
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