class ObtenerCitasAsesorUseCase:

    def __init__(self, repository):
        self.repository = repository

    def ejecutar(self, id_perfil: int):
        return self.repository.obtener_por_perfil(id_perfil)