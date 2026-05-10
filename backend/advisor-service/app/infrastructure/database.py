import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.domain.advisor import Base

# --- CONFIGURACIÓN DINÁMICA ---
# os.getenv busca la variable en el sistema. Si no la encuentra, usa el valor por defecto (el de tu Docker local).

DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "contrasena12345")
DB_HOST = os.getenv("DB_HOST", "db-sistema.cvjyu96ahzvc.us-east-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "asesor_db")

# Construimos la URL usando las variables anteriores
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- CONEXIÓN ---
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear las tablas si no existen
def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()