from abc import ABC, abstractmethod

class LenguajeRepository(ABC):

    @abstractmethod
    def get_active(self):
        pass