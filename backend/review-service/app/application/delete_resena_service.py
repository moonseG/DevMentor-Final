from app.adapters.repositories.review_repository_mysql import ResenaRepositoryMySQL

class DeleteResenaService:
    def __init__(self):
        # Instanciamos el repositorio que conecta con MySQL
        self.repository = ResenaRepositoryMySQL()

    def execute(self, id_resena: int) -> bool:
        # Llamamos al método de eliminación del repositorio
        return self.repository.delete_resena(id_resena)