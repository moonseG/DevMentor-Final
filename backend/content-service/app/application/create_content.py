import os
import shutil

from fastapi import UploadFile
from app.infrastructure.content_repository import ContentRepository

UPLOAD_DIR = "uploads"

class CreateContentUseCase:

    def __init__(self, repository: ContentRepository):
        self.repository = repository

    def execute(
        self,
        id_perfil: int,
        id_materia: int,
        file: UploadFile
    ):

        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        tamaño = os.path.getsize(file_path)

        content = self.repository.create_content(
            id_perfil=id_perfil,
            id_materia=id_materia,
            nombre_archivo=file.filename,
            ruta_archivo=file_path,
            tipo=file.content_type,
            tamaño=tamaño
        )

        return content.to_dict()