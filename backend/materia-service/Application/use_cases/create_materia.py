from Domain.entities.materia import Materia

class CreateMateriaUseCase:

    def __init__(self, repository):
        self.repository = repository

    def execute(self, nombre, descripcion, semestre, carrera_id, activa):

        if semestre < 1 or semestre > 9:
            raise ValueError("Semestre debe estar entre 1 y 9")

        nueva_materia = Materia(
            nombre=nombre,
            descripcion=descripcion,
            semestre=semestre,
            carrera_id=carrera_id, 
            activa=activa
        )

        return self.repository.create(nueva_materia)