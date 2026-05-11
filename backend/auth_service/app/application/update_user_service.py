from fastapi import HTTPException
from passlib.context import CryptContext

from app.adapters.repositories.user_repository_mysql import UserRepositoryMySQL

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UpdateUserService:

    def __init__(self):
        self.repository = UserRepositoryMySQL()

    def execute(
        self,
        id_usuario: int,
        nombre: str = None,
        correo: str = None,
        telefono: str = None,
        contrasena: str = None,
        foto_perfil: str = None,
    ):
        existing_user = self.repository.get_user_by_id(id_usuario)

        if not existing_user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        normalized_correo = correo.strip() if correo is not None else None
        if normalized_correo is not None and not normalized_correo.endswith("@unach.mx"):
            raise HTTPException(
                status_code=400,
                detail="El correo debe ser institucional (@unach.mx)",
            )

        password_hash = None
        if contrasena is not None and contrasena != "":
            # bcrypt only supports up to 72 bytes.
            password_hash = pwd_context.hash(contrasena[:72])

        updated_user = self.repository.update_user(
            id_usuario=id_usuario,
            nombre=nombre.strip() if nombre is not None else None,
            correo=normalized_correo,
            telefono=telefono.strip() if telefono is not None else None,
            contrasena=password_hash,
            foto_perfil=foto_perfil.strip() if foto_perfil is not None else None,
        )

        if not updated_user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        return {
            "id": updated_user.get("id_usuario", id_usuario),
            "nombre": updated_user["nombre"],
            "correo": updated_user["correo"],
            "telefono": updated_user["telefono"],
            "rol": updated_user["rol"],
            "foto_perfil": updated_user.get("foto_perfil"),
        }
