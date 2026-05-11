from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.adapters.controllers.auth_controller import router

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)