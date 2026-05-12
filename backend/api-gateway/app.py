import os
import requests
import httpx
from fastapi import FastAPI, Request, Response, Depends
from fastapi.security import HTTPBearer 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import List 

security = HTTPBearer()
app = FastAPI(title="DevMentor API Gateway")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURACIÓN DE PUERTOS (AJUSTADO PARA DOCKER/NUBE) ---
# CAMBIO AQUÍ: Usamos os.getenv para que Docker Compose mande las URLs correctas
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8001")
MATERIA_SERVICE_URL = os.getenv("MATERIA_SERVICE_URL", "http://materia-service:8002")
ADVISOR_SERVICE_URL = os.getenv("ADVISOR_SERVICE_URL", "http://advisor_service:8003")
REVIEW_SERVICE_URL = os.getenv("REVIEW_SERVICE_URL", "http://review-service:8004")
CALENDAR_SERVICE_URL = os.getenv("CALENDAR_SERVICE_URL", "http://calendar-service:8007")

# Seguridad
# CAMBIO AQUÍ: Usa la misma llave que en Auth Service
#JWT_SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("JWT_SECRET_KEY") or "Taller2026" 
#JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

JWT_SECRET_KEY = "Taller2026"
JWT_ALGORITHM = "HS256"

# AGREGA ESTE PRINT PARA VERLO EN LOS LOGS
print(f"DEBUG: El Gateway está usando la llave: {JWT_SECRET_KEY}")

PUBLIC_ROUTES = {
    ("POST", "/auth/login"),
    ("POST", "/auth/register"),
}

PUBLIC_PATH_PREFIXES = {
    "/docs",
    "/redoc",
    "/openapi.json",
}

# --- FUNCIONES DE UTILIDAD ---

def is_public_route(request: Request) -> bool:
    if request.method == "OPTIONS":
        return True
    if (request.method, request.url.path) in PUBLIC_ROUTES:
        return True
    for prefix in PUBLIC_PATH_PREFIXES:
        if request.url.path.startswith(prefix):
            return True
    return False

def build_forward_headers(request: Request):
    headers = {}
    authorization = request.headers.get("Authorization")
    print(f"DEBUG: Auth Header recibido: {authorization}")
    if authorization:
        headers["Authorization"] = authorization

    user_id = getattr(request.state, "user_id", None)
    print(f"DEBUG: User ID en state: {user_id}")
    user_role = getattr(request.state, "user_role", None)

    if user_id:
        headers["X-User-ID"] = user_id
    if user_role:
        headers["X-User-Role"] = user_role

    return headers

def forward_response(response):
    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type", "application/json")
    )

# --- MIDDLEWARE DE AUTORIZACIÓN ---
@app.middleware("http")
async def authorization_middleware(request: Request, call_next):
    if is_public_route(request):
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized: Missing Token"})

    token = auth_header.split(" ", 1)[1].strip()

    # Busca esta parte en tu Gateway
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        request.state.user_id = payload.get("sub")
        request.state.user_role = payload.get("role")
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={"detail": "Token expirado"})
    except jwt.JWTError:
        return JSONResponse(status_code=401, content={"detail": "Firma invalida"})
    except Exception as e:
        return JSONResponse(status_code=401, content={"detail": str(e)})

    return await call_next(request)
# --- RUTAS: AUTH SERVICE (8001) ---

# Definimos qué necesita el login
class LoginSchema(BaseModel):
    correo: str
    contrasena: str

@app.post("/auth/login")
async def login(datos: LoginSchema, request: Request):
    # Esto mandará el JSON con la llave "contrasena" al microservicio 8001
    response = requests.post(
        f"{AUTH_SERVICE_URL}/auth/login", 
        json=datos.dict()
    )
    return forward_response(response)

class RegisterSchema(BaseModel):
    nombre: str
    correo: str
    telefono: str
    contrasena: str
    rol: str  # Por ejemplo: 'estudiante' o 'asesor'

@app.post("/auth/register")
async def register(datos: RegisterSchema, request: Request):
    # Esto hará que aparezcan los parámetros en Swagger
    response = requests.post(
        f"{AUTH_SERVICE_URL}/auth/register",
        json=datos.dict(),
        headers=build_forward_headers(request)
    )
    return forward_response(response)

@app.get("/auth/users")
async def get_all_users(request: Request, _ = Depends(security)): # <--- Agrega esto
    response = requests.get(
        f"{AUTH_SERVICE_URL}/auth/users", 
        headers=build_forward_headers(request)
    )
    return forward_response(response)

@app.get("/auth/users/{user_id}")
async def get_user_by_id(user_id: int, request: Request, _ = Depends(security)): # <--- Agrega el Depends aquí
    response = requests.get(
        f"{AUTH_SERVICE_URL}/auth/users/{user_id}", 
        headers=build_forward_headers(request)
    )
    return forward_response(response)

# --- RUTAS: MATERIA SERVICE (8002) ---

@app.get("/materias")
async def get_materias(request: Request, _ = Depends(security)):
    response = requests.get(f"{MATERIA_SERVICE_URL}/materias", headers=build_forward_headers(request))
    return forward_response(response)

@app.get("/lenguajes")
async def get_lenguajes(request: Request, _ = Depends(security)):
    response = requests.get(f"{MATERIA_SERVICE_URL}/lenguajes/", headers=build_forward_headers(request))
    return forward_response(response)

# --- RUTAS: ADVISOR SERVICE (8003) ---
class AdvisorSchema(BaseModel):
    id_usuario_auth: int
    especialidad: str
    area_especialidad: str
    materias: List[int]

@app.post("/advisors")
async def create_advisor(datos: AdvisorSchema, request: Request, _ = Depends(security)):
    response = requests.post(
        f"{ADVISOR_SERVICE_URL}/advisors/", 
        json=datos.dict(), 
        headers=build_forward_headers(request)
    )
    return forward_response(response)

@app.get("/advisors")
async def get_all_advisors(request: Request, _ = Depends(security)):
    response = requests.get(f"{ADVISOR_SERVICE_URL}/advisors/", headers=build_forward_headers(request))
    return forward_response(response)

@app.get("/advisors/{id_perfil}")
async def get_advisor_by_id(id_perfil: int, request: Request, _ = Depends(security)):
    response = requests.get(f"{ADVISOR_SERVICE_URL}/advisors/{id_perfil}", headers=build_forward_headers(request))
    return forward_response(response)

# --- RUTAS: REVIEW SERVICE (8004) ---

class ReviewSchema(BaseModel):
    idUsuario: int
    idUsuarioAuth: int
    idMateria: int
    calificacion: int
    comentario: str

@app.post("/resenas")
async def create_resena(datos: ReviewSchema, request: Request, _ = Depends(security)):
    response = requests.post(
        f"{REVIEW_SERVICE_URL}/resenas/", 
        json=datos.dict(), 
        headers=build_forward_headers(request)
    )
    return forward_response(response)

@app.get("/resenas")
async def list_resenas(request: Request, _ = Depends(security)):
    response = requests.get(f"{REVIEW_SERVICE_URL}/resenas", params=dict(request.query_params), headers=build_forward_headers(request))
    return forward_response(response)

# --- RUTAS: CALENDAR SERVICE (8007) ---

class AgendaSchema(BaseModel):
    id_perfil: int
    id_usuario: int
    fecha: str
    hora: str

@app.post("/calendario/citas")
async def crear_cita(datos: AgendaSchema, request: Request, _ = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CALENDAR_SERVICE_URL}/calendario/citas", 
            json=datos.dict(),
            headers=build_forward_headers(request)
        )
    return Response(
        content=response.content, 
        status_code=response.status_code, 
        media_type="application/json"
    )

class DisponibilidadSchema(BaseModel):
    id_perfil: int
    dia_semana: str  # Ejemplo: "Lunes", "Martes"...
    hora_inicio: str
    hora_fin: str

@app.post("/calendario/disponibilidad")
async def crear_disponibilidad(datos: DisponibilidadSchema, request: Request, _ = Depends(security)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CALENDAR_SERVICE_URL}/calendario/disponibilidad",
            json=datos.dict(),
            headers=build_forward_headers(request)
        )
    return Response(
        content=response.content, 
        status_code=response.status_code, 
        media_type="application/json"
    )

@app.get("/calendario/citas/asesor/{id_perfil}")
async def get_citas_asesor(id_perfil: int, request: Request, _ = Depends(security)):
    response = requests.get(f"{CALENDAR_SERVICE_URL}/calendario/citas/asesor/{id_perfil}", headers=build_forward_headers(request))
    return forward_response(response)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/calendario/disponibilidad") # Quitamos el {id_perfil} de la ruta
async def obtener_disponibilidad(
    id_perfil: int, 
    dia_semana: str, 
    request: Request, 
    _ = Depends(security)
):
    async with httpx.AsyncClient() as client:
        # Pasamos los datos en el diccionario 'params'
        params = {
            "id_perfil": id_perfil,
            "dia_semana": dia_semana
        }
        
        response = await client.get(
            f"{CALENDAR_SERVICE_URL}/calendario/disponibilidad",
            params=params, # <--- Esto los convierte en ?id_perfil=X&dia_semana=Y
            headers=build_forward_headers(request)
        )
        
    return Response(
        content=response.content, 
        status_code=response.status_code, 
        media_type="application/json"
    )
