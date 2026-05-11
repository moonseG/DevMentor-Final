import os

from app.infrastructure.content_repository import ContentRepository

class DeleteContentUseCase:

    def __init__(self, repository: ContentRepository):
        self.repository = repository

    def execute(self, id_contenido: int):

        content = self.repository.get_by_id(id_contenido)

        if not content:
            raise ValueError("Contenido no encontrado")

        if os.path.exists(content.ruta_archivo):
            os.remove(content.ruta_archivo)

        deleted = self.repository.delete_content(id_contenido)

        return {
            "deleted": deleted
        }