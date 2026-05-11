import os
import smtplib
import httpx
from email.message import EmailMessage
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "notificaciones.devmentor@gmail.com"
SENDER_PASSWORD = "soldaqwptxkohyzw"

app = FastAPI(title="Notification Service - DevMentor")

class NotificationRequest(BaseModel):
    correo_destino: str
    tipo_notificacion: str
    datos_extra: Dict[str, Any] = {}

def enviar_correo_real(destino: str, asunto: str, cuerpo: str):
    msg = EmailMessage()
    msg.set_content(cuerpo)
    msg["Subject"] = asunto
    msg["From"] = SENDER_EMAIL
    msg["To"] = destino

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(e)

@app.post("/notificar")
async def procesar_notificacion(req: NotificationRequest, background_tasks: BackgroundTasks):
    asunto = ""
    cuerpo = ""

    if req.tipo_notificacion == "ALERTA_LOGIN":
        asunto = "Alerta de Seguridad: Nuevo inicio de sesion"
        cuerpo = (
            "Hola,\n\n"
            "Hemos detectado un nuevo inicio de sesion en tu cuenta de Administrador en DevMentor.\n"
            "Si no fuiste tu, por favor contacta a soporte de inmediato para asegurar tu cuenta."
        )

    elif req.tipo_notificacion == "CUENTA_SUSPENDIDA":
        nombre = req.datos_extra.get("nombre", "Usuario")
        asunto = "Aviso Importante: Cuenta Suspendida"
        cuerpo = (
            f"Hola {nombre},\n\n"
            "Te informamos que tu acceso a la plataforma DevMentor ha sido suspendido "
            "debido a reportes de comportamiento que violan nuestras politicas comunitarias.\n\n"
            "Si crees que esto es un error, por favor contacta a la administracion de la UNACH."
        )
        
    else:
        raise HTTPException(status_code=400, detail="Tipo de notificacion no registrado")

    background_tasks.add_task(enviar_correo_real, req.correo_destino, asunto, cuerpo)

    return {
        "status": "success", 
        "mensaje": "Notificacion encolada exitosamente", 
        "tipo": req.tipo_notificacion
    }