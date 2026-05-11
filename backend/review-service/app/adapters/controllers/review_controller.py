from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from app.application.create_resena_service import CreateResenaService
from app.application.list_resenas_service import ListResenasService
from app.application.delete_resena_service import DeleteResenaService
from app.application.update_resena_estado_service import UpdateResenaEstadoService

router = APIRouter(prefix="/resenas", tags=["resenas"])


class CreateResenaRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id_usuario: int = Field(gt=0, alias="idUsuario")
    id_usuario_auth: int = Field(gt=0, alias="idUsuarioAuth")
    id_materia: int = Field(gt=0, alias="idMateria")
    calificacion: int = Field(ge=1, le=5)
    comentario: str = Field(min_length=3, max_length=2000)


class UpdateResenaEstadoRequest(BaseModel):
    estado: str = Field(min_length=3, max_length=10)


def _format_fecha(fecha_creacion):
    if isinstance(fecha_creacion, datetime):
        if fecha_creacion.tzinfo is None:
            fecha_creacion = fecha_creacion.replace(tzinfo=timezone.utc)
        return fecha_creacion.isoformat()

    if fecha_creacion is None:
        return ""

    return str(fecha_creacion)


def _format_resena(resena):
    id_usuario_auth = resena.get("id_usuario_auth", resena.get("id_asesor"))

    return {
        "idResena": resena["id_resena"],
        "idUsuario": resena["id_usuario"],
        "idUsuarioAuth": id_usuario_auth,
        # Compatibilidad temporal con clientes que aun leen idAsesor.
        "idAsesor": id_usuario_auth,
        "nombreUsuario": resena.get("nombre_usuario"),
        "nombreAsesor": resena.get("nombre_asesor"),
        "idMateria": resena["id_materia"],
        "calificacion": resena["calificacion"],
        "comentario": resena["comentario"],
        "estado": resena.get("estado"),
        "fechaCreacion": _format_fecha(resena["fecha_creacion"]),
    }


@router.post("")
def create_resena(data: CreateResenaRequest):
    service = CreateResenaService()

    created = service.execute(
        id_usuario=data.id_usuario,
        id_usuario_auth=data.id_usuario_auth,
        id_materia=data.id_materia,
        calificacion=data.calificacion,
        comentario=data.comentario,
    )

    return {
        "message": "Resena creada correctamente",
        "resena": _format_resena(created),
    }


@router.get("")
def list_resenas(
    id_usuario: Optional[int] = Query(default=None, gt=0, alias="idUsuario"),
    id_usuario_auth: Optional[int] = Query(default=None, gt=0, alias="idUsuarioAuth"),
    id_materia: Optional[int] = Query(default=None, gt=0, alias="idMateria"),
    estado: Optional[str] = Query(default=None),
):
    if estado is not None and estado not in {"pendiente", "aceptada", "rechazada"}:
        raise HTTPException(status_code=400, detail="Estado de resena no valido")

    service = ListResenasService()
    rows = service.execute(
        id_usuario=id_usuario,
        id_usuario_auth=id_usuario_auth,
        id_materia=id_materia,
        estado=estado,
    )

    return {
        "resenas": [_format_resena(row) for row in rows],
    }


@router.put("/{id_resena}/estado")
def update_resena_estado(id_resena: int, data: UpdateResenaEstadoRequest):
    if data.estado not in {"pendiente", "aceptada", "rechazada"}:
        raise HTTPException(status_code=400, detail="Estado de resena no valido")

    service = UpdateResenaEstadoService()
    updated = service.execute(id_resena=id_resena, estado=data.estado)

    if updated is None:
        raise HTTPException(status_code=404, detail="Resena no encontrada")

    return {
        "message": "Estado actualizado correctamente",
        "resena": _format_resena(updated),
    }

@router.delete("/{id_resena}")
def delete_resena(id_resena: int):
    service = DeleteResenaService()
    
    eliminado = service.execute(id_resena)
    
    if not eliminado:
        raise HTTPException(status_code=404, detail="Resena no encontrada")
        
    return {"message": "Resena eliminada correctamente"}