from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Infrastructure.api.materia_controller import router
from Infrastructure.api.lenguaje_controller import router as lenguaje_router
from Infrastructure.database.connection import engine, Base

# IMPORTANTE: importar entidades
from Domain.entities.materia import Materia
from Domain.entities.carrera import Carrera

app = FastAPI(title="Materia Service")
app.include_router(lenguaje_router)


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Base.metadata.create_all(bind=engine)

app.include_router(router)
app.include_router(lenguaje_router)