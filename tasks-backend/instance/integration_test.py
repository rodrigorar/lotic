import logging

SQLALCHEMY_DATABASE_URI = "sqlite:///integration_tests.sqlite"
LOGGING_CONFIG = "instance/integration_logging.conf"
LOGGING_LEVEL = logging.INFO
SECRET_KEY = "ZDk0OWQ5ZDYtNjQxYy00YWE3LTlhZTktZTU0Njg0NzhjZjRmCg=="
ACCESS_TOKEN_TTL_HOURS = 1
REFRESH_TOKEN_TTL_DAYS = 1
