package com.lotic.tasks.ui.login

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
import androidx.compose.ui.text.intl.Locale
import androidx.compose.ui.text.intl.LocaleList
import androidx.compose.ui.text.toLowerCase
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.lotic.tasks.R
import com.lotic.tasks.ui.shared.SharedViewModel

private fun doLogin(uiState: LoginUIState, signInNavigation: () -> Unit, viewModel: LoginViewModel) {
    viewModel.login(uiState.subject.toLowerCase(Locale.current), uiState.secret)
    signInNavigation()
}

@Composable
fun LoginScreen(
    signInNavigation: () -> Unit
    , modifier: Modifier = Modifier
    , loginViewModel: LoginViewModel = viewModel()) {

    val uiState = loginViewModel.uiState
    val focusManager = LocalFocusManager.current

    Column(
        horizontalAlignment = Alignment.CenterHorizontally
        , verticalArrangement = Arrangement.Center
        , modifier = modifier
            .fillMaxWidth()
            .fillMaxHeight()
    ) {
        Text(
            text = stringResource(R.string.sign_in_title)
            , fontSize = MaterialTheme.typography.h1.fontSize
            , fontWeight = MaterialTheme.typography.h1.fontWeight
            , color = MaterialTheme.colors.primary)
        Spacer(modifier = modifier.padding(15.dp))
        OutlinedTextField(
            value = uiState.subject
            , onValueChange = { loginViewModel.updateSubject(it) }
            , keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next)
            , keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) })
            , shape = MaterialTheme.shapes.medium)
        Spacer(modifier = modifier.padding(6.dp))
        OutlinedTextField(
            value = uiState.secret
            , onValueChange = { loginViewModel.updateSecret(it) }
            , visualTransformation = PasswordVisualTransformation()
            , keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done)
            , keyboardActions = KeyboardActions(onDone = { doLogin(
                uiState = uiState
                , signInNavigation = {
                    signInNavigation()
                    SharedViewModel.getTaskList()
                }
                , viewModel = loginViewModel) })
            , shape = MaterialTheme.shapes.medium)
        Spacer(modifier = modifier.padding(10.dp))
        OutlinedButton(
            onClick = { doLogin(
                uiState = uiState
                , signInNavigation = signInNavigation
                , viewModel = loginViewModel) }
            , shape = MaterialTheme.shapes.medium
            , colors = ButtonDefaults.buttonColors(
                backgroundColor = MaterialTheme.colors.primary)
            , modifier = modifier.padding(15.dp)
        ) {
            Text(text = stringResource(R.string.sign_in_btn))
        }
    }
}