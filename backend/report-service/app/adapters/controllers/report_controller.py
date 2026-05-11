from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.infrastructure.database import SessionLocal
from app.domain.report import Report

router = APIRouter(prefix="/reportes")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class CreateReportRequest(BaseModel):
    tipo_entidad: str
    id_entidad: int = None
    motivo: str
    prioridad: str = "Media"

class UpdateEstadoRequest(BaseModel):
    estado: str

@router.post("/")
def create_report(data: CreateReportRequest, db: Session = Depends(get_db)):
    # Aquí deberías extraer el id_usuario_reporta del token JWT en el futuro
    nuevo_reporte = Report(
        id_usuario_reporta=1, # Hardcodeado temporalmente
        tipo_entidad=data.tipo_entidad,
        id_entidad=data.id_entidad,
        motivo=data.motivo,
        prioridad=data.prioridad
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)
    return nuevo_reporte.to_dict()

@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    reportes = db.query(Report).all()
    return [r.to_dict() for r in reportes]

@router.get("/usuario/{id_usuario}")
def get_reports_by_user(id_usuario: int, db: Session = Depends(get_db)):
    # Buscamos reportes donde el id_entidad coincida (si es tipo 'Usuario') 
    # o donde el id_usuario_objetivo coincida
    reportes = db.query(Report).filter(Report.id_usuario_objetivo == id_usuario).all()
    return [r.to_dict() for r in reportes]

@router.put("/{id_reporte}/estado")
def update_report_status(id_reporte: int, data: UpdateEstadoRequest, db: Session = Depends(get_db)):
    from app.domain.report import Report # Ajusta el import según tu estructura
    reporte = db.query(Report).filter(Report.id_reporte == id_reporte).first()
    
    if not reporte:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
        
    reporte.estado = data.estado
    db.commit()
    db.refresh(reporte)
    
    return reporte.to_dict()