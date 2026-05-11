from sqlalchemy import Column, Integer, String, DateTime, Enum, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Report(Base):
    __tablename__ = "reportes"
    id_reporte = Column(Integer, primary_key=True, index=True)
    id_usuario_reporta = Column(Integer, nullable=False)
    id_usuario_objetivo = Column(Integer, nullable=False)
    tipo_entidad = Column(Enum('Usuario', 'Resena', 'Contenido', 'Fallo_Sistema', 'Otro'), nullable=False)
    id_entidad = Column(Integer, nullable=True)
    motivo = Column(String(500), nullable=False)
    estado = Column(Enum('Pendiente', 'En Revision', 'Resuelto', 'Rechazado'), default='Pendiente')
    prioridad = Column(Enum('Baja', 'Media', 'Alta'), default='Media')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id_reporte": self.id_reporte,
            "id_usuario_reporta": self.id_usuario_reporta,
            "id_usuario_objetivo": self.id_usuario_objetivo,
            "tipo_entidad": self.tipo_entidad,
            "id_entidad": self.id_entidad,
            "motivo": self.motivo,
            "estado": self.estado,
            "prioridad": self.prioridad,
            "created_at": str(self.created_at)
        }