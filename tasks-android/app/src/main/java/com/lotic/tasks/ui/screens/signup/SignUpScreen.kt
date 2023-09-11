package com.lotic.tasks.ui.screens.signup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedButton
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.lotic.tasks.R

@Composable
fun SignUpScreen(
    navigationCallback: () -> Unit
    , modifier: Modifier = Modifier
    , viewModel: SignUpViewModel = viewModel()) {

    val focusManager = LocalFocusManager.current

    Column(horizontalAlignment = Alignment.CenterHorizontally
        , verticalArrangement = Arrangement.Center
        , modifier = modifier
            .fillMaxWidth()
            .fillMaxHeight()) {

        Text(
            text = stringResource(R.string.sign_up_title)
            , fontSize = MaterialTheme.typography.h1.fontSize
            , fontWeight = MaterialTheme.typography.h1.fontWeight
            , color = MaterialTheme.colors.primary)

        Spacer(modifier = modifier.padding(15.dp))

        OutlinedTextField(
            value = viewModel.uiState.username
            , onValueChange = { viewModel.updateUsername(it) }
            , keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next)
            , keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down )})
            , shape = MaterialTheme.shapes.medium)

        Spacer(modifier = modifier.padding(6.dp))

        OutlinedTextField(
            value = viewModel.uiState.password
            , onValueChange = { viewModel.updatePassword(it) }
            , visualTransformation = PasswordVisualTransformation()
            , keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next)
            , keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down )})
            , shape = MaterialTheme.shapes.medium)

        Spacer(modifier = modifier.padding(10.dp))

        OutlinedTextField(
            value = viewModel.uiState.passwordMatch
            , onValueChange = { viewModel.updatePasswordMatch(it) }
            , visualTransformation = PasswordVisualTransformation()
            , keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done)
            , keyboardActions = KeyboardActions(onDone = { viewModel.signUp(navigationCallback) })
            , shape = MaterialTheme.shapes.medium)

        Spacer(modifier = modifier.padding(6.dp))

        OutlinedButton(
            onClick = { viewModel.signUp(navigationCallback) }
            , shape = MaterialTheme.shapes.medium
            , colors = ButtonDefaults.buttonColors(backgroundColor = MaterialTheme.colors.primary)
            , enabled = viewModel.uiState.canSignUp
            , modifier = modifier.padding(15.dp)) {
            Text(text = stringResource(R.string.sign_up_btn))
        }
    }
}