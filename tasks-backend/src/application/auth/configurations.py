class AuthTokenTTLConfigs:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self.access_token_ttl_hours = 1
        self.refresh_token_ttl_days = 3

    def with_access_token_ttl_hours(self, ttl: int):
        if ttl is not None:
            self.access_token_ttl_hours = ttl

    def with_refresh_token_ttl_days(self, ttl: int):
        if ttl is not None:
            self.refresh_token_ttl_days = ttl
