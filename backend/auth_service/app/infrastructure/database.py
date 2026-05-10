import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURACIÓN PARA AWS Y LOCAL ---
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "contrasena12345")
DB_HOST = os.getenv("DB_HOST", "db-sistema.cvjyu96ahzvc.us-east-1.rds.amazonaws.com")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "asesorias")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- CONEXIÓN ---
engine = create_engine(DATABASE_URL, connect_args={"ssl": {"fake_config": True}})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ... (configuración de engine y SessionLocal igual) ...

Base = declarative_base()

try:
    from app.domain.user import User # Importamos el usuario que ya tiene su propio Base
    
    # Usamos el metadata del modelo directamente
    User.metadata.create_all(bind=engine)
    print("Conexión exitosa y tablas creadas en AWS.")
except Exception as e:
    print(f"Error en Auth DB: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()