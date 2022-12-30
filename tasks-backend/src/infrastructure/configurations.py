
class AppConfigurations:
    _instance = None
    _app_config = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def set_app_config(self, app_config):
        if self._app_config is not None:
            raise AttributeError("App Configuration has already been assigned")
        self._app_config = app_config

    def database_uri(self):
        return self._app_config.get('SQLALCHEMY_DATABASE_URI')

    def config_file(self):
        return self._app_config.get('LOGGING_CONFIG')

    def logging_level(self):
        return self._app_config.get('LOGGING_LEVEL')

    def secret_key(self):
        return self._app_config.get('SECRET_KEY')
