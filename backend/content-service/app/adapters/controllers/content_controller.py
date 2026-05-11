from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.infrastructure.database import SessionLocal
from app.infrastructure.content_repository import ContentRepository

from app.application.create_content import CreateContentUseCase
from app.application.get_contents import (
    GetContentsByMateriaUseCase,
    GetContentsByPerfilUseCase
)
from app.application.delete_content import DeleteContentUseCase
from fastapi import HTTPException, Request
from fastapi import Header


router = APIRouter(prefix="/contents")

def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/upload/")
def upload_content(
    request: Request,
    id_perfil: int = Form(...),
    id_materia: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user_id = request.headers.get("X-User-ID")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")

    use_case = CreateContentUseCase(repository := ContentRepository(db))
    return use_case.execute(id_perfil, id_materia, file)

@router.get("/materia/{id_materia}")
def get_by_materia(
    id_materia: int,
    db: Session = Depends(get_db)
):

    repository = ContentRepository(db)

    use_case = GetContentsByMateriaUseCase(repository)

    return use_case.execute(id_materia)


@router.get("/perfil/{id_perfil}")
def get_by_perfil(
    id_perfil: int,
    db: Session = Depends(get_db)
):

    repository = ContentRepository(db)

    use_case = GetContentsByPerfilUseCase(repository)

    return use_case.execute(id_perfil)


@router.get("/download/{id_contenido}")
def download_content(
    id_contenido: int,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = request.headers.get("X-User-ID")
    role = request.headers.get("X-User-Role")

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    repository = ContentRepository(db)
    content = repository.get_by_id(id_contenido)

    return FileResponse(
        content.ruta_archivo,
        filename=content.nombre_archivo
    )


@router.delete("/{id_contenido}")
def delete_content(
    id_contenido: int,
    request: Request,
    db: Session = Depends(get_db)
):

    role = request.headers.get("X-User-Role")

    if role not in ["admin", "asesor"]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para eliminar contenido"
        )

    repository = ContentRepository(db)
    use_case = DeleteContentUseCase(repository)

    return use_case.execute(id_contenido)