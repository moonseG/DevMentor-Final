from sqlalchemy.orm import Session
from app.domain.advisor import AdvisorProfile
import json

class AdvisorRepository:
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_advisor(self, id_usuario_auth: int, especialidad: str, 
                      area_especialidad: str, materias: list) -> AdvisorProfile:
        """Crear un nuevo perfil de asesor"""
        advisor = AdvisorProfile(
            id_usuario_auth=id_usuario_auth,
            especialidad=especialidad,
            area_especialidad=area_especialidad,
            materias=materias,  # SQLAlchemy maneja JSON automáticamente
            estado_aprobacion='Pendiente'
        )
        self.db.add(advisor)
        self.db.commit()
        self.db.refresh(advisor)
        return advisor
    
    def get_advisor_by_user_id(self, id_usuario_auth: int) -> AdvisorProfile:
        """Obtener perfil de asesor por ID de usuario"""
        return self.db.query(AdvisorProfile).filter(
            AdvisorProfile.id_usuario_auth == id_usuario_auth
        ).first()
    
    def get_advisor_by_id(self, id_perfil: int) -> AdvisorProfile:
        """Obtener perfil de asesor por ID de perfil"""
        return self.db.query(AdvisorProfile).filter(
            AdvisorProfile.id_perfil == id_perfil
        ).first()
    
    def get_all_advisors(self) -> list:
        """Obtener todos los asesores"""
        return self.db.query(AdvisorProfile).all()
    
    def update_advisor(self, id_perfil: int, especialidad: str = None,
                      area_especialidad: str = None, materias: list = None, aprobado: bool = None,
                      estado_aprobacion: str = None) -> AdvisorProfile:
        """Actualizar perfil de asesor"""
        advisor = self.get_advisor_by_id(id_perfil)
        
        if advisor is None:
            advisor.estado_aprobacion = 'Aprobado' if aprobado else 'Rechazado'
            advisor.approved = 1 if aprobado else 0 # Sincroniza ambos
        
        if especialidad:
            advisor.especialidad = especialidad
        if area_especialidad:
            advisor.area_especialidad = area_especialidad
        if materias:
            advisor.materias = materias
        if aprobado is not None:
            advisor.estado_aprobacion = 'Aprobado' if aprobado else 'Rechazado'
        if estado_aprobacion:
            advisor.estado_aprobacion = estado_aprobacion
        
        self.db.commit()
        self.db.refresh(advisor)
        return advisor
    
    def delete_advisor(self, id_perfil: int) -> bool:
        """Eliminar perfil de asesor"""
        advisor = self.get_advisor_by_id(id_perfil)
        
        if advisor is None:
            return False
        
        self.db.delete(advisor)
        self.db.commit()
        return True
