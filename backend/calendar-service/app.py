from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from infrastructure.database.connection import engine, Base
from infrastructure.api.calendar_controller import router
from infrastructure.api.disponibilidad_router import router as disponibilidad_router


app = FastAPI(title="Calendar Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(router)
app.include_router(disponibilidad_router)