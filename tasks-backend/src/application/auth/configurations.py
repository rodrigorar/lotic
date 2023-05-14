class AuthTokenTTLConfigs:
    _instance = None
    __access_token_ttl_hours = None
    __refresh_token_ttl_days = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def with_access_token_ttl_hours(self, provider):
        if provider is not None:
            self.__access_token_ttl_hours = provider

    def with_refresh_token_ttl_days(self, provider):
        if provider is not None:
            self.__refresh_token_ttl_days = provider

    def get_access_token_ttl(self):
        result = 1
        if self.__access_token_ttl_hours is not None:
            result = self.__access_token_ttl_hours()
        return result

    def get_refresh_token_ttl(self):
        result = 3
        if self.__refresh_token_ttl_days is not None:
            result = self.__refresh_token_ttl_days()
        return result
