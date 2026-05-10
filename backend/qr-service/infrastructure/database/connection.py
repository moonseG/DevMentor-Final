import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- CONFIGURACIÓN DINÁMICA ---
# Si estos microservicios comparten la BD, en AWS les pasaremos el mismo DB_NAME
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "12345")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3308")
DB_NAME = os.getenv("DB_NAME", "asesor_db")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- MOTOR Y SESIÓN ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# --- DEPENDENCIA ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()