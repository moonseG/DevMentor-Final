from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from infrastructure.database.connection import get_db
from infrastructure.repositories.cita_repository_impl import CitaRepositoryImpl
from application.use_cases.crear_cita import CrearCitaUseCase
from infrastructure.api.schemas import CitaCreate
from application.use_cases.obtener_citas_asesor import ObtenerCitasAsesorUseCase
from application.use_cases.cancelar_cita import CancelarCitaUseCase
import httpx

AUTH_SERVICE_URL = "http://localhost:8001"

router = APIRouter(prefix="/calendario", tags=["Calendario"])

@router.post("/citas")
def crear_cita(data: CitaCreate, db: Session = Depends(get_db)):

    repository = CitaRepositoryImpl(db)
    use_case = CrearCitaUseCase(repository)

    return use_case.ejecutar(
        data.id_perfil,
        data.id_usuario,
        data.fecha,
        data.hora
    )

@router.get("/citas/asesor/{id_perfil}")
async def obtener_citas_asesor(id_perfil: int, db: Session = Depends(get_db)):
    repo  = CitaRepositoryImpl(db)
    citas = ObtenerCitasAsesorUseCase(repo).ejecutar(id_perfil)

    # Recopilar ids únicos de usuarios para una sola ronda de peticiones
    ids_unicos = list({ c.id_usuario for c in citas if c.id_usuario })

    nombres = {}
    async with httpx.AsyncClient() as client:
        for uid in ids_unicos:
            try:
                res = await client.get(f"{AUTH_SERVICE_URL}/auth/users/{uid}")
                if res.status_code == 200:
                    nombres[uid] = res.json().get("nombre", f"Alumno #{uid}")
                else:
                    nombres[uid] = f"Alumno #{uid}"
            except Exception:
                nombres[uid] = f"Alumno #{uid}"

    return [
        {
            "id":             c.id,
            "id_usuario":     c.id_usuario,
            "nombre_alumno":  nombres.get(c.id_usuario, f"Alumno #{c.id_usuario}"),
            "fecha":          str(c.fecha),
            "hora":           str(c.hora),
            "estado":         c.estado,
            "estado_qr":      c.estado_qr,
            "token_qr":       c.token_qr,
        }
        for c in citas
    ]

@router.patch("/citas/{id_cita}/cancelar")
def cancelar_cita(id_cita: int, db: Session = Depends(get_db)):
    repo = CitaRepositoryImpl(db)
    return CancelarCitaUseCase(repo).ejecutar(id_cita)