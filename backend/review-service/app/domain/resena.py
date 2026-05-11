from sqlalchemy import Column, Integer, Text, Enum, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

# Definimos los estados posibles según tu tabla
class EstadoResena(str, enum.Enum):
    pendiente = "pendiente"
    aceptada = "aceptada"
    rechazada = "rechazada"

class Resena(Base):
    __tablename__ = "resenas"

    id_resena = Column(Integer, primary_key=True, index=True)
    
    # Tus atributos del __init__
    id_usuario = Column(Integer, nullable=False)
    id_usuario_auth = Column(Integer, nullable=False)
    id_materia = Column(Integer, nullable=False)
    calificacion = Column(Integer, nullable=False)
    comentario = Column(Text, nullable=False)
    
    # Campo para la fecha (automático)
    fecha_creacion = Column(DateTime, server_default=func.now())
    
    # Tu atributo estado con el Enum
    estado = Column(Enum(EstadoResena), default=EstadoResena.pendiente)

    # El método para convertirlo a diccionario (útil para el Controller)
    def to_dict(self):
        return {
            "id_resena": self.id_resena,
            "id_usuario": self.id_usuario,
            "id_usuario_auth": self.id_usuario_auth,
            "id_materia": self.id_materia,
            "calificacion": self.calificacion,
            "comentario": self.comentario,
            "fecha_creacion": str(self.fecha_creacion),
            "estado": self.estado
        }