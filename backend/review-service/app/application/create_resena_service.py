from fastapi import HTTPException

from app.adapters.repositories.review_repository_mysql import ResenaRepositoryMySQL
from app.domain.resena import Resena


class CreateResenaService:
    def __init__(self):
        self.repository = ResenaRepositoryMySQL()

    def execute(self, id_usuario, id_usuario_auth, id_materia, calificacion, comentario):
        normalized_comment = comentario.strip()
        if not normalized_comment:
            raise HTTPException(status_code=400, detail="El comentario es obligatorio")

        if calificacion < 1 or calificacion > 5:
            raise HTTPException(status_code=400, detail="La calificacion debe estar entre 1 y 5")

        if not self.repository.user_exists(id_usuario):
            raise HTTPException(status_code=400, detail="El usuario que escribe la resena no existe")

        if not self.repository.user_exists(id_usuario_auth):
            raise HTTPException(status_code=400, detail="El asesor seleccionado no existe")

        resena = Resena(
            id_usuario=id_usuario,
            id_usuario_auth=id_usuario_auth,
            id_materia=id_materia,
            calificacion=calificacion,
            comentario=normalized_comment,
            estado="pendiente",
        )

        created_resena = self.repository.create_resena(resena)

        if created_resena is None:
            raise HTTPException(status_code=500, detail="No se pudo crear la resena")

        return created_resena
