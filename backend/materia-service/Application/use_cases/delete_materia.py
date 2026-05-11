from sqlalchemy.orm import Session
from Domain.entities.materia import Materia

class DeleteMateriaUseCase:
    def __init__(self, db: Session):
        self.db = db

    def execute(self, materia_id: int):
        materia = self.db.query(Materia).filter(Materia.id == materia_id).first()

        if not materia:
            raise Exception("Materia no encontrada")

        self.db.delete(materia)
        self.db.commit()

        return {"message": "Materia eliminada exitosamente"}