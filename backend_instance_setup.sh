#!/bin/bash

set -euo pipefail

DEPLOYMENT_DIR="current"
ARCHIVE_DIR="archive"
TEMP_DIR="tmp"

SERVICE_NAME="tasks-backend"

VIRTUAL_ENV="menv"
ENTRYPOINT="wsgi.py"

TAR_DIR="tasks_server"

create_logrotate_file {
	local contents=$(cat <<LOGFILE
/home/rodrigorar/logs/app.log {
	# Sets the logs to rotate every week
	daily
	# Tells the system to remove old logs and only keep the three most recent rotated logs
	rotate 3
	# compress and delaycompress: These two options are used together and indicate that 
	# rotated logs should be compressed (gzip) except for the most recent one.
	compress
	# creating a new log file to replace the rotated one
	create
	# do not rotate the log if it is empty
	notifempty
}
LOGFILE
)
	sudo echo "$contents" > /etc/logrotate.d/tasks-backend
}

create_deploy_file() {
local contents=$(cat <<FILE
#!/bin/bash

set -euo pipefail

source "config.env"

stop_server() {
	echo "Stopping server"
	sudo systemctl stop "$SERVICE_NAME"
	sleep 1
}

clear_current_deployment() {
	echo "Clear current deployment"
	mkdir ./"$TEMP_DIR"
	mv ./"$DEPLOYMENT_DIR"/"$ENTRYPOINT" ./"$TEMP_DIR"/"$ENTRYPOINT"
	mv ./"$DEPLOYMENT_DIR"/"$VIRTUAL_ENV" ./"$TEMP_DIR"/"$VIRTUAL_ENV"
	rm -r ./"$DEPLOYMENT_DIR"/*
}

deploy() {
	echo "Deploying new version"
	tar -xvf "$TAR_DIR"*.tar.gz
	mv "$TAR_DIR"*/* ./"$DEPLOYMENT_DIR"
	mv ./"$TEMP_DIR"/"$ENTRYPOINT" ./"$DEPLOYMENT_DIR"/"$ENTRYPOINT"
	mv ./"$TEMP_DIR"/"$VIRTUAL_ENV" ./"$DEPLOYMENT_DIR"/"$VIRTUAL_ENV"
	rm -r ./"$TEMP_DIR"
	mv "$TAR_DIR"*.tar.gz ./"$ARCHIVE_DIR"
	rm -r "$TAR_DIR"*
}

run_schema_migrations() {
	cd ./"$DEPLOYMENT_DIR"
	source ./menv/bin/activate
	APP_CONFIG_FILE="$HOME/config/production.py" flask --app "$HOME/current/src/app" db upgrade
}

start_server() {
	echo "Starting the server..."
	sleep 1
	sudo systemctl start "\$SERVICE_NAME"
}

stop_server
clear_current_deployment
deploy
run_schema_migrations
start_server
FILE
)
    echo "$contents" > deploy.sh
    chmod +x deploy.sh
}

configure_home() {
    mkdir archive config current data logs installed_software
}

setup_python_env() {

	echo "Configuring the virtual environment..."
	
	cd ./"$DEPLOYMENT_DIR"
	virtualenv -p python3 "$VIRTUAL_ENV"
	cd ..

	echo "Installing dependencies..."
	
	cd ./"$DEPLOYMENT_DIR"
	source ./"$DEPLOYMENT_DIR"/bin/activate
	pip3 install \ 
		flask \
		gunicorn \
		sqlalchemy \
		flask-sqlalchemy \
		flask-migrate \
		python-dateutil \
        bcrypt
}

create_deploy_file
configure_home
setup_python_env

rm ./backend_instance_setup.sh
