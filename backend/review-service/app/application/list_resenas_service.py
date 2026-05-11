from app.adapters.repositories.review_repository_mysql import ResenaRepositoryMySQL


class ListResenasService:
    def __init__(self):
        self.repository = ResenaRepositoryMySQL()

    def execute(self, id_usuario=None, id_usuario_auth=None, id_materia=None, estado=None):
        return self.repository.list_resenas(
            id_usuario=id_usuario,
            id_usuario_auth=id_usuario_auth,
            id_materia=id_materia,
            estado=estado,
        )
