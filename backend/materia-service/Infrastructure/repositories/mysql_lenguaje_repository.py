from sqlalchemy.orm import Session
from Domain.entities.lenguaje import Lenguaje
from Domain.ports.lenguaje_repository import LenguajeRepository


class MySQLLenguajeRepository(LenguajeRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_active(self):
        return self.db.query(Lenguaje).filter(Lenguaje.activo == True).all()

    def create(self, lenguaje_data):
        nuevo = Lenguaje(
            nombre=lenguaje_data.nombre,
            descripcion=lenguaje_data.descripcion,
            activo=lenguaje_data.activo
        )

        self.db.add(nuevo)
        self.db.commit()
        self.db.refresh(nuevo)

        return nuevo