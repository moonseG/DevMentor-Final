from app.domain.user import User
from app.adapters.repositories.user_repository_mysql import UserRepositoryMySQL
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterUserService:

    def __init__(self):
        self.repository = UserRepositoryMySQL()

    def execute(self, nombre, correo, telefono, contrasena, rol):

        if not correo.endswith("@unach.mx"):
            raise Exception("El correo debe ser institucional (@unach.mx)")

        # limitar contraseña a 72 bytes para bcrypt
        password_hash = pwd_context.hash(contrasena[:72])

        user = User(
            nombre=nombre,
            correo=correo,
            telefono=telefono,
            contrasena=contrasena,
            rol=rol
        )

        user_id = self.repository.create_user(user)

        return {
            "message": "Usuario registrado correctamente",
            "id_usuario": user_id,
            "nombre": nombre,
            "rol": rol
        }