from app.adapters.repositories.review_repository_mysql import ResenaRepositoryMySQL


class UpdateResenaEstadoService:
    def __init__(self):
        self.repository = ResenaRepositoryMySQL()

    def execute(self, id_resena: int, estado: str):
        return self.repository.update_resena_estado(id_resena, estado)
