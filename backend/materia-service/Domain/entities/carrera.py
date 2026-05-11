from sqlalchemy import Column, Integer, String
from Infrastructure.database.connection import Base

class Carrera(Base):
    __tablename__ = "carreras"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)