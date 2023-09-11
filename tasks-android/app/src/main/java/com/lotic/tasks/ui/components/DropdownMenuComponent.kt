package com.lotic.tasks.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material.DropdownMenu
import androidx.compose.material.DropdownMenuItem
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.lotic.tasks.R

@Composable
fun DropdownMenuComponent(
    toggleDropdownMenu: () -> Unit
    , isDropdownMenuExpanded: Boolean
    , isAccountLoggedIn: Boolean
    , aboutNavigation: () -> Unit
    , signUpNavigation: () -> Unit
    , signInNavigation: () -> Unit
    , logout: () -> Unit
    , modifier: Modifier = Modifier) {

    Box(contentAlignment = Alignment.Center, modifier = modifier) {
        IconButton(onClick = { toggleDropdownMenu() }) {
            Icon(
                imageVector = Icons.Default.Menu,
                contentDescription = "Open options",
                modifier = modifier.size(30.dp)
            )
        }
        DropdownMenu(
            expanded = isDropdownMenuExpanded
            , onDismissRequest = { toggleDropdownMenu()}) {

            DropdownMenuItem(onClick = { aboutNavigation() }) {
                Text(text = stringResource(R.string.about_btn))
            }

            if (! isAccountLoggedIn) {
                DropdownMenuItem(onClick = { signUpNavigation() }) {
                    Text(text = stringResource(R.string.sign_up_btn))
                }
                DropdownMenuItem(onClick = { signInNavigation() }) {
                    Text(text = stringResource(R.string.sign_in_btn))
                }
            } else {
                DropdownMenuItem(onClick = { logout() }) {
                    Text(text = stringResource(R.string.logout_btn))
                }
            }
        }
    }
}