from pydantic import BaseModel

class MateriaCreateSchema(BaseModel):
    nombre: str
    descripcion: str
    semestre: int
    carrera: str   
    activa: bool

class MateriaUpdateSchema(BaseModel):
    nombre: str
    carrera_id: int
    activa: bool