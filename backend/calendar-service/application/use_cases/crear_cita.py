from domain.entities.cita import Cita

class CrearCitaUseCase:

    def __init__(self, repository):
        self.repository = repository

    def ejecutar(self, id_perfil, id_usuario, fecha, hora):

        cita = Cita(id_perfil, id_usuario, fecha, hora)

        if self.repository.existe(cita):
            raise Exception("Horario no disponible")

        return self.repository.guardar(cita)