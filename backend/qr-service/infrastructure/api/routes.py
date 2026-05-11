from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from infrastructure.database.connection import get_db
from application.use_cases.generar_qr import GenerarQRUseCase
from application.use_cases.verificar_qr import VerificarQRUseCase

router = APIRouter(prefix="/qr", tags=["QR"])


class VerificarBody(BaseModel):
    token_qr: str


@router.post("/generar/{id_cita}")
def generar_qr(id_cita: int, db: Session = Depends(get_db)):
    try:
        return GenerarQRUseCase(db).ejecutar(id_cita)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verificar")
def verificar_qr(body: VerificarBody, db: Session = Depends(get_db)):
    try:
        return VerificarQRUseCase(db).ejecutar(body.token_qr)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/estado/{id_cita}")
def estado_qr(id_cita: int, db: Session = Depends(get_db)):
    from infrastructure.models.cita_model import CitaModel
    cita = db.query(CitaModel).filter(CitaModel.id == id_cita).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return {"id_cita": id_cita, "estado_qr": cita.estado_qr}