from app.infrastructure.advisor_repository import AdvisorRepository

class UpdateAdvisorUseCase:
    
    def __init__(self, repository: AdvisorRepository):
        self.repository = repository
    
    def execute(self, id_perfil: int, especialidad: str = None, 
                area_especialidad: str = None, materias: list = None, aprobado: bool = None,
                estado_aprobacion: str = None):
        """Actualizar perfil de asesor"""
        advisor = self.repository.update_advisor(
            id_perfil=id_perfil,
            especialidad=especialidad,
            area_especialidad=area_especialidad,
            materias=materias,
            aprobado=aprobado,
            estado_aprobacion=estado_aprobacion
        )
        
        if not advisor:
            raise ValueError(f"Asesor no encontrado con ID {id_perfil}")
        
        return advisor.to_dict()


class DeleteAdvisorUseCase:
    
    def __init__(self, repository: AdvisorRepository):
        self.repository = repository
    
    def execute(self, id_perfil: int):
        """Eliminar perfil de asesor"""
        deleted = self.repository.delete_advisor(id_perfil)
        
        if not deleted:
            raise ValueError(f"Asesor no encontrado con ID {id_perfil}")
        
        return {"message": "Asesor eliminado exitosamente", "id_perfil": id_perfil}
