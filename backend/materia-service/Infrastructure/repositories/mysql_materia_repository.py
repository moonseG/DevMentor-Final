from sqlalchemy.orm import Session
from Domain.entities.materia import Materia
from Domain.ports.materia_repository import MateriaRepository

class MySQLMateriaRepository(MateriaRepository):

    def __init__(self, db: Session):
        self.db = db

    def create(self, materia):
        self.db.add(materia)
        self.db.commit()
        self.db.refresh(materia)
        return materia

    def get_active(self):
        return self.db.query(Materia).filter(Materia.activa == True).all()

    def update(self, id, data):
        materia = self.db.query(Materia).filter(Materia.id == id).first()
        if materia:
            for key, value in data.items():
                setattr(materia, key, value)
            self.db.commit()
            self.db.refresh(materia)
        return materia