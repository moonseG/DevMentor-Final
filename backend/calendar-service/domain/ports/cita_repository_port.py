from abc import ABC, abstractmethod
from domain.entities.cita import Cita

class CitaRepositoryPort(ABC):

    @abstractmethod
    def guardar(self, cita: Cita):
        pass

    @abstractmethod
    def existe(self, cita: Cita) -> bool:
        pass

    @abstractmethod
    def obtener_por_fecha(self, id_perfil: int, fecha: str):
        pass

    @abstractmethod
    def obtener_por_perfil(self, id_perfil: int): pass 

    @abstractmethod
    def cancelar(self, id_cita: int): pass