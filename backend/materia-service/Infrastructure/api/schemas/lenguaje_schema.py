from pydantic import BaseModel


class LenguajeCreate(BaseModel):
    nombre: str
    descripcion: str
    activo: bool = True


class LenguajeResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool

    class Config:
        from_attributes = True