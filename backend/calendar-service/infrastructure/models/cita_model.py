from sqlalchemy import Column, Integer, String, Enum
from infrastructure.database.connection import Base

class CitaModel(Base):
    __tablename__ = "citas"

    id         = Column(Integer, primary_key=True, index=True)
    id_perfil  = Column(Integer)
    id_usuario = Column(Integer)
    fecha      = Column(String(50))
    hora       = Column(String(50))
    estado     = Column(Enum("reservada", "cancelada"),  default="reservada")
    estado_qr  = Column(Enum("pendiente", "completada"), default="pendiente")
    token_qr   = Column(String(255), nullable=True)