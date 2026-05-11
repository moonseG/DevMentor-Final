from app.adapters.repositories.user_repository_mysql import UserRepositoryMySQL
from passlib.context import CryptContext
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginUserService:

    def __init__(self):
        self.repository = UserRepositoryMySQL()

    def execute(self, correo, contrasena):

        user = self.repository.get_user_by_correo(correo)

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if not pwd_context.verify(contrasena, user["contrasena"]):
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")

        return {
            "message": "Login exitoso",
            "usuario": {
                "id": user["id_usuario"],
                "nombre": user["nombre"],
                "correo": user["correo"],
                "rol": user["rol"],
                "foto_perfil": user.get("foto_perfil"),
            }
        }