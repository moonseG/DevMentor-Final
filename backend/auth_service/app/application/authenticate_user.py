from fastapi import HTTPException
from passlib.context import CryptContext

from app.domain.token_provider import TokenProvider
from app.domain.user_repository import UserRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthenticateUser:

    def __init__(self, user_repository: UserRepository, token_provider: TokenProvider):
        self.user_repository = user_repository
        self.token_provider = token_provider

    def execute(self, correo: str, contrasena: str):

        user = self.user_repository.get_user_by_correo(correo)

        if not user:
            raise HTTPException(status_code=401, detail="Credenciales invalidas")

        # NUEVA VALIDACIÓN: Bloqueo de usuarios suspendidos
        if user.get("estado") == "Suspendido":
            raise HTTPException(status_code=403, detail="Tu cuenta ha sido suspendida. Contacta al administrador.")

        if contrasena != user["contrasena"]:
            raise HTTPException(status_code=401, detail="Credenciales invalidas")

        token_payload = {
            "sub": str(user["id"]),
            "role": user["rol"],
        }
        access_token = self.token_provider.create_access_token(token_payload)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "usuario": {
                "id": user["id"],
                "nombre": user["nombre"],
                "correo": user["correo"],
                "rol": user["rol"],
                "foto_perfil": user.get("foto_perfil"),
            },
        }
