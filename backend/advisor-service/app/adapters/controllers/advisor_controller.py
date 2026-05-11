from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.infrastructure.database import SessionLocal
from app.infrastructure.advisor_repository import AdvisorRepository
from app.application.create_advisor import CreateAdvisorUseCase
from app.application.get_advisors import (
    GetAdvisorsUseCase, 
    GetAdvisorByUserIdUseCase,
    GetAdvisorByIdUseCase
)
from app.application.update_advisor import UpdateAdvisorUseCase, DeleteAdvisorUseCase

router = APIRouter(prefix="/advisors")

# Modelos Pydantic
class CreateAdvisorRequest(BaseModel):
    id_usuario_auth: int
    especialidad: str
    area_especialidad: str
    materias: Optional[List[int]] = None

class UpdateAdvisorRequest(BaseModel):
    especialidad: Optional[str] = None
    area_especialidad: Optional[str] = None
    materias: Optional[List[int]] = None
    aprobado: Optional[bool] = None
    estado_aprobacion: Optional[str] = None

# Dependencia para obtener la sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@router.post("/")
def create_advisor(request: CreateAdvisorRequest, db: Session = Depends(get_db)):
    """Crear un nuevo perfil de asesor"""
    try:
        repository = AdvisorRepository(db)
        use_case = CreateAdvisorUseCase(repository)
        return use_case.execute(
            id_usuario_auth=request.id_usuario_auth,
            especialidad=request.especialidad,
            area_especialidad=request.area_especialidad,
            materias=request.materias
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
def get_all_advisors(db: Session = Depends(get_db)):
    """Obtener todos los asesores"""
    try:
        repository = AdvisorRepository(db)
        use_case = GetAdvisorsUseCase(repository)
        return use_case.execute()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{id_usuario_auth}")
def get_advisor_by_user_id(id_usuario_auth: int, db: Session = Depends(get_db)):
    """Obtener perfil de asesor por ID de usuario"""
    try:
        repository = AdvisorRepository(db)
        use_case = GetAdvisorByUserIdUseCase(repository)
        return use_case.execute(id_usuario_auth)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/pending")
def get_pending_advisors(db: Session = Depends(get_db)):
    """Obtener asesores pendientes de aprobación"""
    try:
        repository = AdvisorRepository(db)
        advisors = repository.get_all_advisors()
        pending = [a.to_dict() for a in advisors if getattr(a, 'estado_aprobacion', 'Pendiente') == 'Pendiente']
        return pending
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id_perfil}/approve")
def approve_advisor(id_perfil: int, payload: UpdateAdvisorRequest, db: Session = Depends(get_db)):
    """Aprobar o rechazar un asesor (aprobado: true/false)"""
    try:
        repository = AdvisorRepository(db)
        use_case = UpdateAdvisorUseCase(repository)
        return use_case.execute(
            id_perfil=id_perfil,
            aprobado=payload.aprobado,
            estado_aprobacion=payload.estado_aprobacion
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{id_perfil}")
def get_advisor_by_id(id_perfil: int, db: Session = Depends(get_db)):
    """Obtener perfil de asesor por ID de perfil"""
    try:
        repository = AdvisorRepository(db)
        use_case = GetAdvisorByIdUseCase(repository)
        return use_case.execute(id_perfil)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{id_perfil}")
def update_advisor(id_perfil: int, request: UpdateAdvisorRequest, db: Session = Depends(get_db)):
    """Actualizar perfil de asesor"""
    try:
        repository = AdvisorRepository(db)
        use_case = UpdateAdvisorUseCase(repository)
        return use_case.execute(
            id_perfil=id_perfil,
            especialidad=request.especialidad,
            area_especialidad=request.area_especialidad,
            materias=request.materias,
            aprobado=request.aprobado,
            estado_aprobacion=request.estado_aprobacion
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{id_perfil}")
def delete_advisor(id_perfil: int, db: Session = Depends(get_db)):
    """Eliminar perfil de asesor"""
    try:
        repository = AdvisorRepository(db)
        use_case = DeleteAdvisorUseCase(repository)
        return use_case.execute(id_perfil)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
