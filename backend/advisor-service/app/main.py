from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.adapters.controllers.advisor_controller import router
from app.infrastructure.database import engine, Base

# Crear las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Advisor Service", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(router)

@app.get("/")
def root():
    return {"message": "Advisor Service API"}
