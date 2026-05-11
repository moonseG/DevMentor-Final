from app.infrastructure.content_repository import ContentRepository

class GetContentsByMateriaUseCase:

    def __init__(self, repository: ContentRepository):
        self.repository = repository

    def execute(self, id_materia: int):

        contents = self.repository.get_by_materia(id_materia)

        return [
            c.to_dict()
            for c in contents
        ]


class GetContentsByPerfilUseCase:

    def __init__(self, repository: ContentRepository):
        self.repository = repository

    def execute(self, id_perfil: int):

        contents = self.repository.get_by_perfil(id_perfil)

        return [
            c.to_dict()
            for c in contents
        ]