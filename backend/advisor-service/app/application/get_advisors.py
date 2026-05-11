from app.infrastructure.advisor_repository import AdvisorRepository

class GetAdvisorsUseCase:
    
    def __init__(self, repository: AdvisorRepository):
        self.repository = repository
    
    def execute(self):
        """Obtener todos los asesores"""
        advisors = self.repository.get_all_advisors()
        return [advisor.to_dict() for advisor in advisors]


class GetAdvisorByUserIdUseCase:
    
    def __init__(self, repository: AdvisorRepository):
        self.repository = repository
    
    def execute(self, id_usuario_auth: int):
        """Obtener asesor por ID de usuario"""
        advisor = self.repository.get_advisor_by_user_id(id_usuario_auth)
        if not advisor:
            raise ValueError(f"Asesor no encontrado para usuario {id_usuario_auth}")
        return advisor.to_dict()


class GetAdvisorByIdUseCase:
    
    def __init__(self, repository: AdvisorRepository):
        self.repository = repository
    
    def execute(self, id_perfil: int):
        """Obtener asesor por ID de perfil"""
        advisor = self.repository.get_advisor_by_id(id_perfil)
        if not advisor:
            raise ValueError(f"Asesor no encontrado con ID {id_perfil}")
        return advisor.to_dict()
