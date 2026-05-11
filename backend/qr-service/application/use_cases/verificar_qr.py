class VerificarQRUseCase:

    def __init__(self, db):
        self.db = db

    def ejecutar(self, token: str):
        from infrastructure.models.cita_model import CitaModel

        cita = self.db.query(CitaModel).filter(
            CitaModel.token_qr == token
        ).first()

        if not cita:
            raise Exception("QR inválido")
        if cita.estado_qr == "completada":
            raise Exception("Este QR ya fue utilizado")

        cita.estado_qr = "completada"
        self.db.commit()
        self.db.refresh(cita)

        return {
            "mensaje":   "Asistencia confirmada",
            "id_cita":   cita.id,
            "id_perfil": cita.id_perfil,
            "fecha":     str(cita.fecha),
            "hora":      str(cita.hora),
        }