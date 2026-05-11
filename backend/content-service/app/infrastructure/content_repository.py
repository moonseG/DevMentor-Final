from sqlalchemy.orm import Session
from app.domain.content import Content

class ContentRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_content(
        self,
        id_perfil: int,
        id_materia: int,
        nombre_archivo: str,
        ruta_archivo: str,
        tipo: str,
        tamaño: int
    ):

        content = Content(
            id_perfil=id_perfil,
            id_materia=id_materia,
            nombre_archivo=nombre_archivo,
            ruta_archivo=ruta_archivo,
            tipo=tipo,
            tamaño=tamaño
        )

        self.db.add(content)
        self.db.commit()
        self.db.refresh(content)

        return content

    def get_by_materia(self, id_materia: int):

        return self.db.query(Content).filter(
            Content.id_materia == id_materia
        ).all()

    def get_by_perfil(self, id_perfil: int):

        return self.db.query(Content).filter(
            Content.id_perfil == id_perfil
        ).all()

    def get_by_id(self, id_contenido: int):

        return self.db.query(Content).filter(
            Content.id_contenido == id_contenido
        ).first()

    def delete_content(self, id_contenido: int):

        content = self.get_by_id(id_contenido)

        if not content:
            return False

        self.db.delete(content)
        self.db.commit()

        return True