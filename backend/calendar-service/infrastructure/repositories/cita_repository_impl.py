from domain.ports.cita_repository_port import CitaRepositoryPort
from infrastructure.models.cita_model import CitaModel

class CitaRepositoryImpl(CitaRepositoryPort):

    def __init__(self, db):
        self.db = db

    def guardar(self, cita):
        model = CitaModel(
            id_perfil=cita.id_perfil,
            id_usuario=cita.id_usuario,
            fecha=cita.fecha,
            hora=cita.hora,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model

    def existe(self, cita):
        return self.db.query(CitaModel).filter(
            CitaModel.id_perfil == cita.id_perfil,
            CitaModel.fecha == cita.fecha,
            CitaModel.hora == cita.hora,
        ).first() is not None

    def obtener_por_fecha(self, id_perfil, fecha):
        return self.db.query(CitaModel).filter(
            CitaModel.id_perfil == id_perfil,
            CitaModel.fecha == fecha,
        ).all()

    def obtener_por_perfil(self, id_perfil: int):
        return self.db.query(CitaModel).filter(
            CitaModel.id_perfil == id_perfil,
            CitaModel.estado == "reservada",
        ).order_by(CitaModel.fecha, CitaModel.hora).all()

    def cancelar(self, id_cita: int):
        cita = self.db.query(CitaModel).filter(CitaModel.id == id_cita).first()
        if cita:
            cita.estado = "cancelada"
            self.db.commit()
            self.db.refresh(cita)
        return cita