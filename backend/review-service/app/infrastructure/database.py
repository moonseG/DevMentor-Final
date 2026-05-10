import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- CONFIGURACIÓN DINÁMICA ---
# Buscamos la URL completa o las partes por separado para mayor flexibilidad
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "contrasena12345")
DB_HOST = os.getenv("DB_HOST", "db-sistema.cvjyu96ahzvc.us-east-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "resenas_db")

# Si no pasas una URL completa (REVIEW_DATABASE_URL), la construimos con las partes
DATABASE_URL = os.getenv(
    "REVIEW_DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# --- MOTOR Y SESIÓN ---
# pool_pre_ping=True ayuda a reconectar si la conexión con RDS se pierde por inactividad
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# --- DEPENDENCIA PARA FASTAPI ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()