package com.lotic.tasks.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.Checkbox
import androidx.compose.material.CheckboxDefaults
import androidx.compose.material.MaterialTheme
import androidx.compose.material.TextField
import androidx.compose.material.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.lotic.tasks.domain.modules.tasks.Task

@Composable
fun TaskComponent(
    task: Task
    , title: String
    , titleUpdate: (newTitle: String) -> Unit
    , completion: Boolean
    , completionUpdate: (task: Task) -> Unit
    , focusRequester: FocusRequester
    , modifier: Modifier = Modifier
) {

    Row(
        horizontalArrangement = Arrangement.SpaceEvenly
        , modifier = modifier
            .padding(2.dp)
    ) {
        val focusManager = LocalFocusManager.current

        TextField(
            value = title
            , onValueChange = { titleUpdate(it) }
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
            checked = completion
            , colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colors.primary)
            , onCheckedChange = { completionUpdate(task) }
            , modifier = modifier
                .weight(1f)
                .wrapContentWidth(Alignment.End))

        if (title == "") {
            LaunchedEffect(Unit) {
                focusRequester.requestFocus()
            }
        }
    }
}