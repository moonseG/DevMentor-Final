from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from infrastructure.database.connection import get_db
from infrastructure.repositories.disponibilidad_semanal_repository import DisponibilidadSemanalRepository
from application.use_cases.crear_disponibilidad_semanal import CrearDisponibilidadSemanal
from infrastructure.api.schemas import DisponibilidadSemanalCreate

router = APIRouter(prefix="/calendario", tags=["Calendario"])

@router.get("/disponibilidad")
def obtener_disponibilidad(
    id_perfil: int = Query(...),
    dia_semana: str = Query(...),
    db: Session = Depends(get_db)
):
    repo = DisponibilidadSemanalRepository(db)

    return repo.obtener_por_dia(id_perfil, dia_semana)

@router.post("/disponibilidad")
def crear_disponibilidad(
    data: DisponibilidadSemanalCreate,
    db: Session = Depends(get_db)
):
    repo = DisponibilidadSemanalRepository(db)
    use_case = CrearDisponibilidadSemanal(repo)

    return use_case.ejecutar(data)