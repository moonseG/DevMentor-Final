from sqlalchemy import text
from sqlalchemy.orm import Session
from domain.entities.disponibilidad_semanal import DisponibilidadSemanal
from fastapi import Query

class DisponibilidadSemanalRepository:

    def __init__(self, db: Session):
        self.db = db

    def crear(self, disponibilidad: DisponibilidadSemanal):

        query = text("""
            INSERT INTO disponibilidades 
            (id_perfil, dia_semana, hora_inicio, hora_fin, activo) 
            VALUES (:id_perfil, :dia_semana, :hora_inicio, :hora_fin, :activo)
        """)

        self.db.execute(query, {
            "id_perfil": disponibilidad.id_perfil,
            "dia_semana": disponibilidad.dia_semana,
            "hora_inicio": disponibilidad.hora_inicio,
            "hora_fin": disponibilidad.hora_fin,
            "activo": disponibilidad.activo   
        })

        self.db.commit()

        return {"mensaje": "Disponibilidad creada correctamente"}

    def obtener_por_dia(self, id_perfil: int, dia_semana: str):
        query = text("""
            SELECT hora_inicio, hora_fin
            FROM disponibilidades
            WHERE id_perfil = :id_perfil
            AND dia_semana = :dia_semana
            AND activo = true
        """)

        result = self.db.execute(query, {
            "id_perfil": id_perfil,
            "dia_semana": dia_semana
        })

        rows = result.fetchall()

        return [
            {
                "hora_inicio": str(row.hora_inicio),
                "hora_fin": str(row.hora_fin)
            }
            for row in rows
        ]
