from sqlalchemy import text
from app.infrastructure.database import SessionLocal

class ResenaRepositoryMySQL:
    def user_exists(self, id_usuario):
        db = SessionLocal()

        try:
            query = text(
                """
                SELECT 1
                FROM asesorias.usuarios
                WHERE id = :id_usuario
                LIMIT 1
                """
            )
            row = db.execute(query, {"id_usuario": id_usuario}).fetchone()
            return row is not None
        finally:
            db.close()

    def create_resena(self, resena):
        db = SessionLocal()

        try:
            query = text(
                """
                INSERT INTO resenas (id_usuario, id_usuario_auth, id_materia, calificacion, comentario, estado)
                VALUES (:id_usuario, :id_usuario_auth, :id_materia, :calificacion, :comentario, :estado)
                """
            )

            result = db.execute(
                query,
                {
                    "id_usuario": resena.id_usuario,
                    "id_usuario_auth": resena.id_usuario_auth,
                    "id_materia": resena.id_materia,
                    "calificacion": resena.calificacion,
                    "comentario": resena.comentario,
                    "estado": resena.estado,
                },
            )

            id_resena = result.lastrowid
            db.commit()

            return self.get_resena_by_id(id_resena)
        finally:
            db.close()

    def get_resena_by_id(self, id_resena):
        db = SessionLocal()

        try:
            query = text(
                """
                SELECT
                    r.id_resena,
                    r.id_usuario,
                    r.id_usuario_auth,
                    r.id_materia,
                    r.calificacion,
                    r.comentario,
                    r.estado,
                    r.fecha_creacion,
                    u.nombre AS nombre_usuario,
                    a.nombre AS nombre_asesor
                FROM resenas r
                LEFT JOIN asesorias.usuarios u ON u.id = r.id_usuario
                LEFT JOIN asesorias.usuarios a ON a.id = r.id_usuario_auth
                WHERE r.id_resena = :id_resena
                """
            )

            row = db.execute(query, {"id_resena": id_resena}).fetchone()

            if row:
                return dict(row._mapping)

            return None
        finally:
            db.close()

    def list_resenas(self, id_usuario=None, id_usuario_auth=None, id_materia=None, estado=None):
        db = SessionLocal()

        try:
            conditions = []
            params = {}

            if id_usuario is not None:
                conditions.append("r.id_usuario = :id_usuario")
                params["id_usuario"] = id_usuario

            if id_usuario_auth is not None:
                conditions.append("r.id_usuario_auth = :id_usuario_auth")
                params["id_usuario_auth"] = id_usuario_auth

            if id_materia is not None:
                conditions.append("r.id_materia = :id_materia")
                params["id_materia"] = id_materia

            if estado is not None:
                conditions.append("r.estado = :estado")
                params["estado"] = estado

            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)

            query = text(
                f"""
                SELECT
                    r.id_resena,
                    r.id_usuario,
                    r.id_usuario_auth,
                    r.id_materia,
                    r.calificacion,
                    r.comentario,
                    r.estado,
                    r.fecha_creacion,
                    u.nombre AS nombre_usuario,
                    a.nombre AS nombre_asesor
                FROM resenas r
                LEFT JOIN asesorias.usuarios u ON u.id = r.id_usuario
                LEFT JOIN asesorias.usuarios a ON a.id = r.id_usuario_auth
                {where_clause}
                ORDER BY r.fecha_creacion DESC, r.id_resena DESC
                """
            )

            rows = db.execute(query, params).fetchall()

            return [dict(row._mapping) for row in rows]
        finally:
            db.close()

    def update_resena_estado(self, id_resena: int, estado: str):
        db = SessionLocal()

        try:
            query = text(
                """
                UPDATE resenas
                SET estado = :estado
                WHERE id_resena = :id_resena
                """
            )

            result = db.execute(query, {"estado": estado, "id_resena": id_resena})
            if result.rowcount == 0:
                db.rollback()
                return None

            db.commit()
            return self.get_resena_by_id(id_resena)
        finally:
            db.close()
    
    def delete_resena(self, id_resena: int) -> bool:
        db = SessionLocal()
        try:
            query_check = text("SELECT id_resena FROM resenas WHERE id_resena = :id_resena")
            existe = db.execute(query_check, {"id_resena": id_resena}).fetchone()
            
            if not existe:
                return False
                
            query_delete = text("DELETE FROM resenas WHERE id_resena = :id_resena")
            db.execute(query_delete, {"id_resena": id_resena})
            db.commit()
            return True
        finally:
            db.close()