from pydantic import BaseModel
from datetime import time


class CitaCreate(BaseModel):
    id_perfil: int
    id_usuario: int
    fecha: str
    hora: str

class DisponibilidadSemanalCreate(BaseModel):
    id_perfil: int
    dia_semana: str
    hora_inicio: time
    hora_fin: time