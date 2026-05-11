import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.application.register_user_service import RegisterUserService
from app.application.authenticate_user import AuthenticateUser
from app.application.get_user_service import GetUserService
from app.application.update_user_service import UpdateUserService
from app.adapters.repositories.user_repository_mysql import UserRepositoryMySQL
from app.infrastructure.jose_token_provider import JoseTokenProvider

router = APIRouter(prefix="/auth")

class RegisterRequest(BaseModel):
    nombre: str
    correo: str
    telefono: str
    contrasena: str
    rol: str

class LoginRequest(BaseModel):
    correo: str
    contrasena: str

class UpdateUserRequest(BaseModel):
    nombre: str | None = None
    correo: str | None = None
    telefono: str | None = None
    contrasena: str | None = None
    foto_perfil: str | None = None

class UpdateStatusRequest(BaseModel):
    estado: str

@router.post("/register")
def register_user(data: RegisterRequest):
    service = RegisterUserService()
    return service.execute(
        data.nombre,
        data.correo,
        data.telefono,
        data.contrasena,
        data.rol
    )

@router.post("/login")
def login(data: LoginRequest):
    use_case = AuthenticateUser(
        user_repository=UserRepositoryMySQL(),
        token_provider=JoseTokenProvider(),
    )
    resultado = use_case.execute(data.correo, data.contrasena)

    try:
        requests.post(
            "http://127.0.0.1:8009/notificar",
            json={
                "correo_destino": data.correo,
                "tipo_notificacion": "ALERTA_LOGIN",
                "datos_extra": {}
            },
            timeout=2
        )
    except Exception:
        pass

    return resultado

@router.get("/users/{id_usuario}")
def get_user_by_id(id_usuario: int):
    service = GetUserService()
    return service.execute(id_usuario)

@router.put("/users/{id_usuario}")
def update_user(id_usuario: int, data: UpdateUserRequest):
    service = UpdateUserService()
    return service.execute(
        id_usuario=id_usuario,
        nombre=data.nombre,
        correo=data.correo,
        telefono=data.telefono,
        contrasena=data.contrasena,
        foto_perfil=data.foto_perfil,
    )

@router.get("/users")
def get_all_users():
    repo = UserRepositoryMySQL()
    return repo.get_all_users()

@router.put("/users/{id_usuario}/status")
def update_user_status(id_usuario: int, data: UpdateStatusRequest):
    repo = UserRepositoryMySQL()
    usuario_actualizado = repo.update_status(id_usuario, data.estado)
    
    if not usuario_actualizado:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if data.estado == "Suspendido":
        try:
            requests.post(
                "http://127.0.0.1:8009/notificar", 
                json={
                    "correo_destino": usuario_actualizado["correo"],
                    "tipo_notificacion": "CUENTA_SUSPENDIDA",
                    "datos_extra": {"nombre": usuario_actualizado["nombre"]}
                },
                timeout=2 
            )
        except Exception:
            pass

    return usuario_actualizado