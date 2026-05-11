import uuid, qrcode, io, base64

class GenerarQRUseCase:

    def __init__(self, db):
        self.db = db

    def ejecutar(self, id_cita: int):
        from infrastructure.models.cita_model import CitaModel

        cita = self.db.query(CitaModel).filter(CitaModel.id == id_cita).first()

        if not cita:
            raise Exception("Cita no encontrada")
        if cita.estado_qr == "completada":
            raise Exception("La cita ya fue completada")

        token = str(uuid.uuid4())
        cita.token_qr = token
        self.db.commit()
        self.db.refresh(cita)

        # Generar imagen QR
        qr_img = qrcode.make(token)
        buffer = io.BytesIO()
        qr_img.save(buffer, format="PNG")
        qr_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {
            "id_cita":   id_cita,
            "token_qr":  token,
            "qr_base64": qr_b64,
        }