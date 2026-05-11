from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

# Creamos un Base local solo para este archivo
Base = declarative_base()

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    telefono = Column(String(20))
    contrasena = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)
    foto_perfil = Column(String(255), nullable=True)