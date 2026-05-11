from app.infrastructure.advisor_repository import AdvisorRepository

class CreateAdvisorUseCase:
    
    def __init__(self, repository: AdvisorRepository):
        self.repository = repository
    
    def execute(self, id_usuario_auth: int, especialidad: str, 
                area_especialidad: str, materias: list):
        """
        Crear un nuevo perfil de asesor
        """
        if not id_usuario_auth or not especialidad or not area_especialidad:
            raise ValueError("Los campos id_usuario_auth, especialidad y area_especialidad son obligatorios")
        
        advisor = self.repository.create_advisor(
            id_usuario_auth=id_usuario_auth,
            especialidad=especialidad,
            area_especialidad=area_especialidad,
            materias=materias or []
        )
        
        return advisor.to_dict()
