from sqlalchemy import Column, Integer, String, Boolean, Text
from Infrastructure.database.connection import Base

class Lenguaje(Base):
    __tablename__ = "lenguajes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True)