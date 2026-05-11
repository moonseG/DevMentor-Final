from domain.entities.disponibilidad_semanal import DisponibilidadSemanal

class CrearDisponibilidadSemanal:

    def __init__(self, repo):
        self.repo = repo

    def ejecutar(self, data):

        disponibilidad = DisponibilidadSemanal(
            id=None,
            id_perfil=data.id_perfil,
            dia_semana=data.dia_semana,
            hora_inicio=data.hora_inicio,
            hora_fin=data.hora_fin,
            activo=True
        )

        return self.repo.crear(disponibilidad)