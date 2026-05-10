from sqlalchemy import text
from app.infrastructure.database import SessionLocal
from app.domain.user_repository import UserRepository


class UserRepositoryMySQL(UserRepository):

    def create_user(self, user):

        db = SessionLocal()

        query = text("""
        INSERT INTO usuarios
        (nombre, correo, telefono, contrasena, rol)
        VALUES (:nombre, :correo, :telefono, :contrasena, :rol)
        """)

        result = db.execute(query, {
            "nombre": user.nombre,
            "correo": user.correo,
            "telefono": user.telefono,
            "contrasena": user.contrasena,
            "rol": user.rol
        })

        db.commit()
        
        # Obtener el ID del usuario creado
        user_id = result.lastrowid
        
        db.close()
        
        return user_id


    def get_user_by_correo(self, correo):

        db = SessionLocal()

        query = text("SELECT * FROM usuarios WHERE correo = :correo")

        result = db.execute(query, {"correo": correo}).fetchone()

        db.close()

        if result:
            return dict(result._mapping)

        return None

    def get_user_by_id(self, id_usuario):

        db = SessionLocal()

        query = text("SELECT * FROM usuarios WHERE id = :id_usuario")

        result = db.execute(query, {"id_usuario": id_usuario}).fetchone()

        db.close()

        if result:
            return dict(result._mapping)

        return None

    def update_user(self, id_usuario, nombre=None, correo=None, telefono=None, contrasena=None, foto_perfil=None):

        db = SessionLocal()

        set_clauses = []
        params = {"id_usuario": id_usuario}

        if nombre is not None:
            set_clauses.append("nombre = :nombre")
            params["nombre"] = nombre

        if correo is not None:
            set_clauses.append("correo = :correo")
            params["correo"] = correo

        if telefono is not None:
            set_clauses.append("telefono = :telefono")
            params["telefono"] = telefono

        if contrasena is not None:
            set_clauses.append("contrasena = :contrasena")
            params["contrasena"] = contrasena

        if foto_perfil is not None:
            set_clauses.append("foto_perfil = :foto_perfil")
            params["foto_perfil"] = foto_perfil

        if not set_clauses:
            db.close()
            return self.get_user_by_id(id_usuario)

        query = text(
            f"UPDATE usuarios SET {', '.join(set_clauses)} WHERE id = :id_usuario"
        )

        db.execute(query, params)
        db.commit()
        db.close()

        return self.get_user_by_id(id_usuario)
    
    def update_status(self, id_usuario, estado):
        db = SessionLocal()
        query = text(
            "UPDATE usuarios SET estado = :estado WHERE id = :id_usuario"
        )
        db.execute(query, {"estado": estado, "id_usuario": id_usuario})
        db.commit()
        db.close()
        return self.get_user_by_id(id_usuario)
    
    def get_all_users(self):
        db = SessionLocal()
        
        query = text(
            "SELECT id, nombre, correo, telefono, rol, estado, fecha_registro "
            "FROM usuarios ORDER BY id DESC"
        )
        
        rows = db.execute(query).fetchall()
        db.close()

        # Convertimos los resultados a diccionarios y formateamos la fecha
        usuarios = []
        for row in rows:
            user_dict = dict(row._mapping)
            if user_dict.get("fecha_registro"):
                user_dict["fecha_registro"] = str(user_dict["fecha_registro"]).split()[0] # Solo la fecha YYYY-MM-DD
            usuarios.append(user_dict)
            
        return usuarios