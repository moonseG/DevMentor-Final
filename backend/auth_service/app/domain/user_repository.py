from abc import ABC, abstractmethod


class UserRepository(ABC):

    @abstractmethod
    def get_user_by_correo(self, correo: str):
        pass
