vscode_lsp_terminal_prompt_tracker= {}

1. Instalar Docker Desktop
Descarga e instala Docker Desktop para Windows.

Ábrelo y ve a Settings (el ícono de engranaje arriba a la derecha).

Ve a Resources > WSL Integration.

Asegúrate de que la opción "Enable integration with my default WSL distro" esté activada.

Activa también el interruptor que dice "Ubuntu" (o el nombre de tu distro).

Haz clic en "Apply & restart".

🐳 Fase 2: Levantar la Infraestructura (Bases de Datos)
Abre tu terminal de Ubuntu (WSL2) y ejecuta:
# Entra a la carpeta
cd DevMentor/AdminDevMentor/db-docker

# Desde db-docker, levanta los contenedores en segundo plano
docker-compose up -d --build
Docker leerá el archivo init.sql y creará todas las bases de datos y tablas necesarias automáticamente.

🐍 Fase 3: Microservicios Backend (Entornos Virtuales)
Nuestra arquitectura utiliza múltiples servicios. Para cada uno, debes abrir una pestaña nueva en tu terminal de Ubuntu, crear su entorno virtual, instalar dependencias y arrancarlo.

# Terminal 1
cd backend/auth_service
source usuarios/bin/activate
pip install -r app/requirements.txt
uvicorn app.main:app --port 8001 --reload

# Terminal 2
cd backend/materia-service
source materias/bin/activate
pip install -r requirements.txt
uvicorn app:app --port 8002 --reload

# Terminal 3
cd backend/advisor-service
source advisors/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8003 --reload

# Terminal 4 (reseñas)
cd backend/review-service
source resenas/bin/activate
pip install -r app/requirements.txt
uvicorn app.main:app --port 8004 --reload

# Terminal 5
cd backend/content-service
source contenidos/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8005 --reload

# Terminal 6
cd backend/report-service
source reportes/bin/activate
pip install -r app/requirements.txt 
uvicorn main:app --port 8006 --reload

# Terminal 7
cd backend && cd calendar-service
source calendario/bin/activate
pip install -r app/requirements.txt
uvicorn app:app --reload --port 8007

# Terminal 8
cd backend/api-gateway
python3 -m venv apiGw
source apiGw/bin/activate
pip install -r requirements.txt
uvicorn app:app --port 8000 --reload

🖥️ Fase 4: Iniciar el Fontend de AdminDevMentor
Abre una nueva terminal y ve a la siguiente carpeta:
cd AdminDevMentor
Inicia el frontend:
npm install
npm run dev
👉 Acceso: Abre tu navegador en http://localhost:5173 e inicia sesión con el correo admin1@unach.mx y contraseña 12345. El código de seguridad puede ser cualquier numero de 6 digitos, por ejemplo: "123456"

🧪 Fase 5: Inyectar Datos de Prueba
Ahora que el backend está corriendo en el puerto 8000, abre una nueva terminal de Ubuntu y ejecuta estos comandos uno por uno para crear los usuarios base:

Bash
# 1. Crear Administradores
curl -X 'POST' 'http://127.0.0.1:8001/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"nombre": "Admin Principal", "correo": "admin1@unach.mx", "telefono": "9610000001", "contrasena": "12345", "rol": "Administrador"}'
echo ""

curl -X 'POST' 'http://127.0.0.1:8001/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"nombre": "Admin Secundario", "correo": "admin2@unach.mx", "telefono": "9610000002", "contrasena": "12345", "rol": "Administrador"}'
echo ""

# 2. Crear Asesores
curl -X 'POST' 'http://127.0.0.1:8001/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"nombre": "Asesor Experto", "correo": "asesor1@unach.mx", "telefono": "9610000003", "contrasena": "12345", "rol": "Asesor"}'
echo ""

curl -X 'POST' 'http://127.0.0.1:8001/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"nombre": "Asesor Junior", "correo": "asesor2@unach.mx", "telefono": "9610000004", "contrasena": "12345", "rol": "Asesor"}'
echo ""

# 3. Crear Estudiantes
curl -X 'POST' 'http://127.0.0.1:8001/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"nombre": "Alumno Nuevo", "correo": "estudiante1@unach.mx", "telefono": "9610000005", "contrasena": "12345", "rol": "Estudiante"}'
echo ""

curl -X 'POST' 'http://127.0.0.1:8001/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"nombre": "Alumno Avanzado", "correo": "estudiante2@unach.mx", "telefono": "9610000006", "contrasena": "12345", "rol": "Estudiante"}'
echo ""

# README Original (SIN ADMIN)

vscode_lsp_terminal_prompt_tracker= {}

Los pasos que ya hayan realizado anteriormente como algunos entornos ya creados o bases de datos ya no tienen que repetirlos.
1--------------------------------------------------------------------------------
cd backend/auth_service
python3 -m venv usuarios
source usuarios/bin/activate
pip install -r requirements.txt

CREATE DATABASE asesorias;
	USE asesorias;

	CREATE TABLE usuarios (
		id_usuario INT AUTO_INCREMENT PRIMARY KEY,
		nombre VARCHAR(255) NOT NULL,
		correo VARCHAR(150) NOT NULL UNIQUE,
		telefono VARCHAR(15) NOT NULL,
		contrasena VARCHAR(255) NOT NULL,
		rol ENUM('Estudiante', 'Asesor') NOT NULL,
		fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

2--------------------------------------------------------------------------------
cd backend/materia-service
python3 -m venv materias
source materias/bin/activate
pip install -r requirements.txt

    CREATE DATABASE BD_materias;
    USE BD_materias;
    
    CREATE TABLE carreras (
         id INT AUTO_INCREMENT PRIMARY KEY,
         nombre VARCHAR(100) NOT NULL
    );
    CREATE TABLE materias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        semestre INT NOT NULL,
        carrera_id INT,
        activa BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (carrera_id) REFERENCES carreras(id)
    );

    INSERT INTO carreras (nombre) VALUES ('Ingenieria en Desarrollo y Tecnologias de
    Software');

    INSERT INTO materias (nombre, descripcion, semestre, carrera_id, activa)
    VALUES ('Compiladores', 'compiladores...', 6, 1, 1);
    INSERT INTO materias (nombre, descripcion, semestre, carrera_id, activa)
    VALUES ('Economía', 'Fundamentos de economía ', 6, 1, 1);

3-------------------------------------------------------------------------------------
cd backend/api-gateway 
python3 -m venv apiGw
source apiGw/bin/activate
pip install -r requirements.txt

4-------------------------------------------------------------------------------------
cd backend/advisor-service
python3 -m venv advisors
source advisors/bin/activate
pip install -r requirements.txt

    CREATE DATABASE asesor_db;
    USE asesor_db;
    
    CREATE TABLE asesorias (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_auth INT NOT NULL,
    especialidad VARCHAR(200),
    area_especialidad VARCHAR(200),
    materias JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

5 ------------------------ Microservicio reseñas ---------------------------------
# Base de datos 
CREATE DATABASE resenas_db;
USE resenas_db;

CREATE TABLE resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_asesor INT NOT NULL,
    id_materia INT NOT NULL,
    calificacion TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Pasos para este microservicio 
cd backend/review-service
python3 -m venv resenas
source resenas/bin/activate
pip install -r requirements.txt


6 ---------------------------------------------------------------------------------
# En el .env que se creo en Frontend deben de remplazar lo que tengan por lo siguiente:
 
cd /home/""/DevMentor/Frontendct } from "react";c.ngrok-free.devexport const API_URL =  "https://unvoluble-pei-subrhombic.ngrok-free.dev";

- En las primeras comillas van a remplazar por la carpeta donde tengan el proyecto(wsl), y al final reemplazaran por su url de ngrok

7 ---------------------------------------------------------------------------------
# Deben crear en Frontend/src/config el archivo api.js
- Ahí colocan lo siguiente: 

import Constants from "expo-constants";

const expoConfig = Constants.expoConfig || Constants.manifest;

export const API_URL =
  expoConfig?.extra?.API_URL ||
  "https://splendent-johana-gelatinous.ngrok-free.dev";

- Igualmente remplazan por su url de ngrok

8 ------------------------------------------------------------------------------------
# Tienen que dirigirse al archivo app.json que esta en /Frontend
- Ahí solamente reemplazan ese url por el de ngrok:

    "extra": {
      "API_URL": "https://splendent-johana-gelatinous.ngrok-free.dev"
    }

-----------------------------------------------------------------------------------------
# Terminal 1
cd backend/auth_service
source usuarios/bin/activate
uvicorn app.main:app --port 8001 --reload

# Terminal 2
cd backend/materia-service
source materias/bin/activate
uvicorn app:app --port 8002 --reload

# Terminal 3
cd backend/advisor-service
source advisors/bin/activate
uvicorn app.main:app --port 8003 --reload

# Terminal 4 (reseñas)
cd backend/review-service
source resenas/bin/activate
uvicorn app.main:app --port 8004 --reload

# Terminal 5
cd backend/content-service
source contenidos/bin/activate
uvicorn main:app --port 8005 --reload

# Terminal 6
cd backend && cd calendar-service
source calendario/bin/activate
uvicorn app:app --reload --port 8007

# Terminal 7
cd backend/qr-service
source qr/bin/activate
uvicorn main:app --port 8008 --reload

# Terminal 8
cd backend/api-gateway
source apiGw/bin/activate
uvicorn app:app --port 8000 --reload

# Terminal 9:
cd Frontend
npx expo start --tunnel

# Terminal 10:
ngrok http 8000


-------------------------------------------------------------------------------------------------------------
# crear TABLA DENTRO DE LA BASE DE DATOS DE BD_materias de datos de lenguajes para mostrar en el dashboard
CREATE TABLE lenguajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

# insertar datos para mostrar algo en el dashboar 
INSERT INTO lenguajes (nombre, descripcion, imagen)
    VALUES 
    ('Python', 'Lenguaje versátil y muy usado en backend', 'python.png'),
    ('Java', 'Programación orientada a objetos', 'java.png'),
    ('C++', 'Alto rendimiento y bajo nivel', 'c++.png');

# ------------------------------------------------------------------    

# Código de app.json 
- Este es el Relative path: Frontend/app.json
{
  "expo": {
    "name": "Frontend",
    "slug": "Frontend",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icons/home.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/icons/home.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/icons/home.png"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "API_URL": "https://967b-187-244-118-51.ngrok-free.app"
    }
  }
}

# ----------------------------------------------------------------------

# content-service
CREATE DATABASE content_db;

USE content_db;

CREATE TABLE contenidos (
    id_contenido INT AUTO_INCREMENT PRIMARY KEY,

    id_perfil INT NOT NULL,    
    id_materia INT NOT NULL,    

    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,

    tipo VARCHAR(50),
    tamaño INT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

# crear entorno virtual e instalar dependencias
cd backend/content-service
python3 -m venv contenidos
source contenidos/bin/activate

pip install -r requirements.txt

# ejecutar npm install en Frontend
o instalar: 
cd Frontend
npx expo install expo-document-picker
npx expo install expo-linking

# instalar python-multipart en apiGw
cd backend/api-gateway
source apiGw/bin/activate
pip install python-multipart

# Instalar libreria del calendario dentro de Frontend
npx expo install react-native-calendars

# ----------------------------------
- Pasos que deben ejecutar para lo de JWT:
# api-gateway
cd /home/DevMentor/backend/api-gateway
source apiGw/bin/activate
pip install -r requirements.txt
# auth_service
cd /home/DevMentor/backend/auth_service
source usuarios/bin/activate
pip install -r app/requirements.txt

- Si tienen algun error en una libreria que no les carga, deben elegir o verifica que el intérprete activo sea el del servicio, es decir, elegir python.



# ------------------------------------------------------------

# Calendario
en la base de datos de asesor_db crear la tabla siguiente:
CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_perfil INT,
  id_usuario INT,
  fecha DATE,
  hora TIME,
  estado ENUM('reservada','cancelada') DEFAULT 'reservada',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
  FOREIGN KEY (id_perfil) REFERENCES asesorias(id_perfil));

# crear entorno virtual del microservicio de calendario
cd backend && cd calendar-service
python3 -m venv calendario
source calendario/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8007

# -----------------------------------------------------------
- Cambio en la Base de datos de "resenas_db", en la tabla resenas. Se agrego el estado de la reseña que verifica el administrador

ALTER TABLE resenas 
ADD COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente';

# -----------------------------------------------------------

# Edit in api.js

import Constants from "expo-constants";
import { getAccessToken } from "../services/sessionService";

const expoConfig = Constants.expoConfig || Constants.manifest;

export const API_URL =
  expoConfig?.extra?.API_URL ||
  "https://unvoluble-pei-subrhombic.ngrok-free.dev";   -> cambien su url

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAccessToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? {}
    : {
        "Content-Type": "application/json",
      };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
       ...options.headers,
    },
  });
};

# --------------------------------------------------------------------

USE asesor_db;
ALTER TABLE asesorias ADD COLUMN approved TINYINT(1) DEFAULT 0;

- Cuando se hace el cambio y no acepta el "approved", se cambia por "aprobado" en español

# ---------------------------------------------------------------------

source backend/content-service/contenidos/bin/activate
pip install cryptography

# ------------------------------------------------------------------------------------------------------
Instalar en Frontend lo siguiente (sirve para solucionar el problema al descargar los contenidos)

cd Frontend
npx expo install expo-file-system
npx expo install expo-sharing

# En la base de datos de asesor crear la siguiente tabla:
CREATE TABLE disponibilidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_perfil INT NOT NULL,
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

# Insercion de todas las materias de LIDTS
# entrar a base de datos de docker:
  docker exec -it admin-devmentor-mysql bash

# ejecutar (las primeras dos lineas copien las dos al mismo tiempo y la tercera por aparte despues de ejecutar las primeras):
  export LANG=C.UTF-8
  mysql -u root -p --default-character-set=utf8mb4
  
  SET NAMES utf8mb4;

# seleccionar la base de datos:
  use BD_materias

# insertar y borrar los datos anteriores:
  TRUNCATE TABLE materias;

  INSERT INTO materias (id, nombre, descripcion, semestre, carrera_id, activa, created_at) VALUES

  (1,'Compiladores','Fases y diseño de compiladores.',6,1,1,'2026-04-30 03:39:43'),
  (2,'Contabilidad y finanzas','Principios contables y análisis financiero.',6,1,1,'2026-04-30 03:39:43'),
  (3,'Economía','Conceptos básicos de economía aplicada.',6,1,1,'2026-04-30 03:39:43'),
  (4,'Interfaces humano-computadora','Diseño centrado en el usuario.',6,1,1,'2026-04-30 03:39:43'),
  (5,'Modelos y metodologías de desarrollo de software','Metodologías ágiles y tradicionales.',6,1,1,'2026-04-30 03:39:43'),
  (6,'Protocolos de enrutamiento','Configuración y administración de rutas.',6,1,1,'2026-04-30 03:39:43'),
  (7,'Taller de Desarrollo 4','Proyecto práctico de desarrollo.',6,1,1,'2026-04-30 03:39:43'),
  (8,'Inglés','Comprensión y comunicación avanzada.',6,1,1,'2026-04-30 03:39:43'),

  (9,'Fundamentos de matemáticas','Bases matemáticas para el razonamiento lógico y analítico.',1,1,1,'2026-05-03 21:49:34'),
  (10,'Matemáticas discretas','Estructuras matemáticas para la computación y lógica.',1,1,1,'2026-05-03 21:50:58'),
  (11,'Física','Principios fundamentales del movimiento y la energía.',1,1,1,'2026-05-03 21:52:08'),
  (12,'Metodología de la programación','Técnicas básicas para resolver problemas con código.',1,1,1,'2026-05-03 21:52:08'),
  (13,'Programación estructurada','Programación organizada con estructuras de control.',1,1,1,'2026-05-03 21:52:08'),
  (14,'Taller de competencias informacionales','Búsqueda, análisis y uso ético de información.',1,1,1,'2026-05-03 21:52:08'),

  (15,'Cálculo diferencial','Estudio de límites, derivadas y aplicaciones.',2,1,1,'2026-05-03 21:53:42'),
  (16,'Álgebra lineal','Vectores, matrices y sistemas de ecuaciones.',2,1,1,'2026-05-03 21:53:42'),
  (17,'Programación orientada a objetos','Clases, objetos, herencia y encapsulamiento.',2,1,1,'2026-05-03 21:53:42'),
  (18,'Estructura de datos','Organización eficiente de datos en memoria.',2,1,1,'2026-05-03 21:53:42'),
  (19,'Electricidad y electrónica','Fundamentos de circuitos y componentes electrónicos.',2,1,1,'2026-05-03 21:53:42'),
  (20,'Taller de metodología de la investigación','Proceso científico y elaboración de proyectos.',2,1,1,'2026-05-03 21:53:42'),

  (21,'Cálculo integral','Integrales y aplicaciones en ingeniería.',3,1,1,'2026-05-03 21:55:13'),
  (22,'Métodos numéricos','Algoritmos para resolver problemas matemáticos.',3,1,1,'2026-05-03 21:55:13'),
  (23,'Programación avanzada','Técnicas avanzadas y optimización de código.',3,1,1,'2026-05-03 21:55:13'),
  (25,'Sistemas digitales','Diseño y análisis de circuitos digitales.',3,1,1,'2026-05-03 21:55:13'),
  (26,'Diseño de bases de datos','Modelado y creación de bases relacionales.',3,1,1,'2026-05-03 21:55:13'),
  (27,'Taller de desarrollo 1','Proyecto práctico de desarrollo de software.',3,1,1,'2026-05-03 21:55:13'),

  (28,'Ecuaciones diferenciales','Modelado matemático con ecuaciones diferenciales.',4,1,1,'2026-05-03 21:56:11'),
  (29,'Probabilidad y estadística','Análisis de datos y variables aleatorias.',4,1,1,'2026-05-03 21:56:11'),
  (30,'Programación distribuida y en paralelo','Sistemas concurrentes y procesamiento paralelo.',4,1,1,'2026-05-03 21:56:11'),
  (31,'Estudio de las organizaciones','Estructura y funcionamiento empresarial.',4,1,1,'2026-05-03 21:56:11'),
  (32,'Arquitectura de computadoras','Diseño y funcionamiento del hardware.',4,1,1,'2026-05-03 21:56:11'),
  (33,'Administración de bases de datos','Gestión y optimización de bases de datos.',4,1,1,'2026-05-03 21:56:11'),
  (34,'Taller de desarrollo 2','Desarrollo práctico de proyectos de software.',4,1,1,'2026-05-03 21:56:11'),

  (35,'Teoría matemática de la computación','Autómatas, lenguajes formales y complejidad.',5,1,1,'2026-05-03 21:57:49'),
  (36,'Investigación de operaciones','Optimización y toma de decisiones cuantitativas.',5,1,1,'2026-05-03 21:57:49'),
  (37,'Calidad en los procesos de desarrollo de software','Modelos y métricas para asegurar calidad.',5,1,1,'2026-05-03 21:57:49'),
  (38,'Traductores de bajo nivel','Compiladores, ensambladores y análisis léxico.',5,1,1,'2026-05-03 21:57:49'),
  (39,'Fundamentos de redes','Protocolos, modelos OSI y comunicación de datos.',5,1,1,'2026-05-03 21:57:49'),
  (40,'Tópicos avanzados de bases de datos','Optimización y tecnologías avanzadas de datos.',5,1,1,'2026-05-03 21:57:49'),
  (41,'Taller de desarrollo 3','Proyecto integrador de desarrollo de software.',5,1,1,'2026-05-03 21:57:49'),

  (42,'Desarrollo de aplicaciones web y móviles','Creación de apps web y móviles.',7,1,1,'2026-05-03 21:58:36'),
  (43,'Sistemas operativos','Gestión de procesos, memoria y archivos.',7,1,1,'2026-05-03 21:58:36'),
  (44,'Conmutadores y redes inalámbricas','Configuración de switches y redes WiFi.',7,1,1,'2026-05-03 21:58:36'),
  (45,'Inteligencia artificial','Algoritmos inteligentes y aprendizaje automático.',7,1,1,'2026-05-03 21:58:36'),

  (46,'Administración de sistemas operativos','Configuración y gestión avanzada de sistemas.',8,1,1,'2026-05-03 21:59:04'),
  (47,'Cómputo distribuido','Sistemas distribuidos y procesamiento remoto.',8,1,1,'2026-05-03 21:59:04'),
  (48,'Graficación','Modelado y renderizado de gráficos computacionales.',8,1,1,'2026-05-03 21:59:04'),
  (49,'Taller de investigación en las ciencias computacionales','Desarrollo de proyectos de investigación aplicada.',8,1,1,'2026-05-03 21:59:04'),

  (50,'Taller de elaboración del informe de investigación','Redacción y presentación formal del proyecto final.',9,1,1,'2026-05-03 21:59:25');

# ------------------------------------------------------------------------------------------------------
- Microservicio de QR

- Crear entorno e instalar dependencias

cd backend/qr-service
python3 -m venv qr
source qr/bin/activate
pip install -r requirements.txt

- Modificar la base de datos
use asesor_db;

ALTER TABLE citas 
ADD COLUMN estado_qr ENUM('pendiente','completada') DEFAULT 'pendiente',
ADD COLUMN token_qr VARCHAR(255) NULL;

- instalar dependencia
cd Frontend

npx expo install expo-camera

cd backend/calendar-service
source calendario/bin/activate

pip install httpx
# -------------------------------------------------------------------------------------------------------
columna para guardar la foto de perfil

USE asesorias;
ALTER TABLE usuarios ADD COLUMN foto_perfil LONGTEXT NULL;

# --------------------------------------------------
# datos con tildes en lenguajes
# entrar a docker 
docker exec -it admin-devmentor-mysql bash

export LANG=C.UTF-8
mysql -u root -p --default-character-set=utf8mb4



use BD_materias;

UPDATE lenguajes
SET descripcion = "Lenguaje versátil y fácil de aprender"
WHERE id=1;

UPDATE lenguajes
SET descripcion = "Orientado a objetos y robusto"
WHERE id=2;