from dataclasses import dataclass
from datetime import time

@dataclass
class DisponibilidadSemanal:
    id: int | None
    id_perfil: int
    dia_semana: str
    hora_inicio: time
    hora_fin: time
    activo: bool = True