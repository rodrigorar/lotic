from logging import Logger
from typing import Optional
from src.domain import ConflictError


class BaseRepository:

    def get_by_id(self, unit_of_work, entity_id) -> Optional:
        raise NotImplemented("BaseRepository#get_by_id is not implemented!")

    def insert(self, unit_of_work, entity):
        raise NotImplemented("BaseRepository#insert is not implemented!")

    def update(self, unit_of_work, entity):
        raise NotImplemented("BaseRepository#update is not implemented!")

    def delete(self, unit_of_work, entity_id):
        raise NotImplemented("BaseRepository#delete is not implemented!")


class BaseBusinessRule:

    def __init__(self, unit_of_work):
        self.unit_of_work = unit_of_work

    def execute(self, port):
        raise NotImplemented("BaseService#execute is not implemented!")


class DatabaseProvider:
    _instance = None
    _database = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def set_database(self, database):
        self._database = database

    def get(self):
        return self._database


class LogProvider:
    _instance = None
    _logger = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def set_logger(self, logger: Logger):
        if self._logger is not None:
            raise ConflictError("logger is already configured, failing")
        self._logger = logger

    def get(self) -> Logger:
        return self._logger
