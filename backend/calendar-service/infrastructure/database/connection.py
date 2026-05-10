import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- CONFIGURACIÓN DINÁMICA ---
# Si no encuentra la variable en AWS, usa los valores de tu Docker local
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "contrasena12345")
DB_HOST = os.getenv("DB_HOST", "db-sistema.cvjyu96ahzvc.us-east-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "asesor_db")

# Construcción de la URL
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- MOTOR Y SESIÓN ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# --- DEPENDENCIA PARA FASTAPI ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()