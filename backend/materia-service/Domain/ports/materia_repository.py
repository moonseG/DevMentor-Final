from abc import ABC, abstractmethod

class MateriaRepository(ABC):

    @abstractmethod
    def create(self, materia):
        pass

    @abstractmethod
    def get_active(self):
        pass

    @abstractmethod
    def update(self, id, data):
        pass