#!/bin/bash

USER='<user>'
PASSWORD='<password>'

usermod --password "$PASSWORD" "$USER"
usermod -aG sudo "$USER"  
