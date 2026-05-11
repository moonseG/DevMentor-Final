from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Content(Base):

    __tablename__ = "contenidos"

    id_contenido = Column(Integer, primary_key=True, index=True)

    id_perfil = Column(Integer, nullable=False)
    id_materia = Column(Integer, nullable=False)

    nombre_archivo = Column(String(255))
    ruta_archivo = Column(String(500))

    tipo = Column(String(50))
    tamaño = Column(Integer)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

    def to_dict(self):
        return {
            "id_contenido": self.id_contenido,
            "id_perfil": self.id_perfil,
            "id_materia": self.id_materia,
            "nombre_archivo": self.nombre_archivo,
            "ruta_archivo": self.ruta_archivo,
            "tipo": self.tipo,
            "tamaño": self.tamaño,
            "created_at": str(self.created_at)
        }