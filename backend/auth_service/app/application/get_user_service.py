from fastapi import HTTPException
from app.adapters.repositories.user_repository_mysql import UserRepositoryMySQL


class GetUserService:

    def __init__(self):
        self.repository = UserRepositoryMySQL()

    def execute(self, id_usuario: int):
        user = self.repository.get_user_by_id(id_usuario)

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        return {
            "id": user.get("id_usuario", user.get("id", id_usuario)),
            "nombre": user["nombre"],
            "correo": user["correo"],
            "telefono": user["telefono"],
            "rol": user["rol"],
            "foto_perfil": user.get("foto_perfil"),
        }
