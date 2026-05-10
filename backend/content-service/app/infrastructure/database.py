import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.domain.content import Base

# --- CONFIGURACIÓN DINÁMICA ---
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "contrasena12345")
DB_HOST = os.getenv("DB_HOST", "db-sistema.cvjyu96ahzvc.us-east-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "content_db") # Base de datos específica

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- MOTOR Y SESIÓN ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear tablas (esto correrá en el contenedor de AWS al iniciar)
Base.metadata.create_all(bind=engine)