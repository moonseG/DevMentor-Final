class CancelarCitaUseCase:

    def __init__(self, repository):
        self.repository = repository

    def ejecutar(self, id_cita: int):
        cita = self.repository.cancelar(id_cita)
        if not cita:
            raise Exception("Cita no encontrada")
        return cita