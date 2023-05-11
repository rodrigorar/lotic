class AppConfigurations:
    _instance = None
    _app_config = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def set_app_config(self, app_config):
        from src.application.auth.configurations import AuthTokenTTLConfigs

        if self._app_config is None:
            self._app_config = app_config

            # Configure Auth Tokens TTL Config
            value = AuthTokenTTLConfigs()
            value.with_access_token_ttl_hours(self.access_token_ttl_hours())
            value.with_refresh_token_ttl_days(self.refresh_token_ttl_days())

    def database_uri(self):
        return self._app_config.get("SQLALCHEMY_DATABASE_URI")

    def config_file(self):
        return self._app_config.get("LOGGING_CONFIG")

    def logging_level(self):
        return self._app_config.get("LOGGING_LEVEL")

    def secret_key(self):
        return self._app_config.get("SECRET_KEY")

    def access_token_ttl_hours(self):
        return self._app_config.get("ACCESS_TOKEN_TTL_HOURS")

    def refresh_token_ttl_days(self):
        return self._app_config.get("REFRESH_TOKEN_TTL_DAYS")
