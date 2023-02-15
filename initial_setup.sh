#!/bin/bash

USER='rodrigorar'
PASSWORD='$1$R.bWqSt2$b5I1ORkHPshxW31lj0HnZ/'

usermod --password "$PASSWORD" "$USER"
usermod -aG sudo "$USER"  