from sqlalchemy.orm import Session
from Domain.entities.materia import Materia

class UpdateMateriaUseCase:
    def __init__(self, db: Session):
        self.db = db

    def execute(self, materia_id: int, nombre: str, carrera_id: int, activa: bool = True):
        materia = self.db.query(Materia).filter(Materia.id == materia_id).first()

        if not materia:
            raise Exception("Materia no encontrada")

        materia.nombre = nombre
        materia.carrera_id = carrera_id
        materia.activa = activa

        self.db.commit()
        self.db.refresh(materia)

        return materia