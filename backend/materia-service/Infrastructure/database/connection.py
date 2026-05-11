import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- CONFIGURACIÓN PARA RDS ---
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "contrasena12345")
DB_HOST = os.getenv("DB_HOST", "db-sistema.cvjyu96ahzvc.us-east-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "BD_materias")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- MOTOR Y SESIÓN ---
engine = create_engine(DATABASE_URL, connect_args={"ssl": {"fake_config": True}})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Definimos Base aquí primero
Base = declarative_base()

# --- CREACIÓN DE TABLAS ---
try:
    # MOVEMOS TODAS AQUÍ ADENTRO (Incluida Carrera)
    from Domain.entities.lenguaje import Lenguaje
    from Domain.entities.materia import Materia
    from Domain.entities.carrera import Carrera
    
    # Ahora que Base ya existe y las entidades están cargadas:
    Base.metadata.create_all(bind=engine)
    print("Conexión exitosa y tablas creadas en AWS.")
except Exception as e:
    print(f"No se pudo conectar a la DB: {e}")

# Generador de sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()