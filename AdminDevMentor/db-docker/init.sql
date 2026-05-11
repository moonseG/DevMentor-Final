-- =====================================================================
-- 1. BASE DE DATOS DE USUARIOS (AUTH SERVICE)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS asesorias CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asesorias;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(15) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('Estudiante', 'Asesor', 'Administrador') NOT NULL,
    estado ENUM('Activo', 'Suspendido') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 2. BASE DE DATOS DE MATERIAS (MATERIA SERVICE)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS BD_materias CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE BD_materias;

CREATE TABLE IF NOT EXISTS carreras (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    semestre INT NOT NULL,
    carrera_id INT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
);

CREATE TABLE IF NOT EXISTS lenguajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    imagen VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO carreras (id, nombre) VALUES (1, 'Ingeniería en Desarrollo y Tecnologías de Software');

INSERT INTO lenguajes (nombre, descripcion, imagen) VALUES 
('Python', 'Lenguaje versátil y muy usado en backend', 'python.png'),
('Java', 'Programación orientada a objetos', 'java.png'),
('C++', 'Alto rendimiento y bajo nivel', 'c++.png');

INSERT INTO materias (id, nombre, descripcion, semestre, carrera_id, activa, created_at) VALUES
(1,'Compiladores','Fases y diseño de compiladores.',6,1,1,'2026-04-30 03:39:43'), (2,'Contabilidad y finanzas','Principios contables y análisis financiero.',6,1,1,'2026-04-30 03:39:43'), (3,'Economía','Conceptos básicos de economía aplicada.',6,1,1,'2026-04-30 03:39:43'), (4,'Interfaces humano-computadora','Diseño centrado en el usuario.',6,1,1,'2026-04-30 03:39:43'), (5,'Modelos y metodologías de desarrollo de software','Metodologías ágiles y tradicionales.',6,1,1,'2026-04-30 03:39:43'), (6,'Protocolos de enrutamiento','Configuración y administración de rutas.',6,1,1,'2026-04-30 03:39:43'), (7,'Taller de Desarrollo 4','Proyecto práctico de desarrollo.',6,1,1,'2026-04-30 03:39:43'), (8,'Inglés','Comprensión y comunicación avanzada.',6,1,1,'2026-04-30 03:39:43'),
(9,'Fundamentos de matemáticas','Bases matemáticas para el razonamiento lógico y analítico.',1,1,1,'2026-05-03 21:49:34'), (10,'Matemáticas discretas','Estructuras matemáticas para la computación y lógica.',1,1,1,'2026-05-03 21:50:58'), (11,'Física','Principios fundamentales del movimiento y la energía.',1,1,1,'2026-05-03 21:52:08'), (12,'Metodología de la programación','Técnicas básicas para resolver problemas con código.',1,1,1,'2026-05-03 21:52:08'), (13,'Programación estructurada','Programación organizada con estructuras de control.',1,1,1,'2026-05-03 21:52:08'), (14,'Taller de competencias informacionales','Búsqueda, análisis y uso ético de información.',1,1,1,'2026-05-03 21:52:08'),
(15,'Cálculo diferencial','Estudio de límites, derivadas y aplicaciones.',2,1,1,'2026-05-03 21:53:42'), (16,'Álgebra lineal','Vectores, matrices y sistemas de ecuaciones.',2,1,1,'2026-05-03 21:53:42'), (17,'Programación orientada a objetos','Clases, objetos, herencia y encapsulamiento.',2,1,1,'2026-05-03 21:53:42'), (18,'Estructura de datos','Organización eficiente de datos en memoria.',2,1,1,'2026-05-03 21:53:42'), (19,'Electricidad y electrónica','Fundamentos de circuitos y componentes electrónicos.',2,1,1,'2026-05-03 21:53:42'), (20,'Taller de metodología de la investigación','Proceso científico y elaboración de proyectos.',2,1,1,'2026-05-03 21:53:42'),
(21,'Cálculo integral','Integrales y aplicaciones en ingeniería.',3,1,1,'2026-05-03 21:55:13'), (22,'Métodos numéricos','Algoritmos para resolver problemas matemáticos.',3,1,1,'2026-05-03 21:55:13'), (23,'Programación avanzada','Técnicas avanzadas y optimización de código.',3,1,1,'2026-05-03 21:55:13'), (25,'Sistemas digitales','Diseño y análisis de circuitos digitales.',3,1,1,'2026-05-03 21:55:13'), (26,'Diseño de bases de datos','Modelado y creación de bases relacionales.',3,1,1,'2026-05-03 21:55:13'), (27,'Taller de desarrollo 1','Proyecto práctico de desarrollo de software.',3,1,1,'2026-05-03 21:55:13'),
(28,'Ecuaciones diferenciales','Modelado matemático con ecuaciones diferenciales.',4,1,1,'2026-05-03 21:56:11'), (29,'Probabilidad y estadística','Análisis de datos y variables aleatorias.',4,1,1,'2026-05-03 21:56:11'), (30,'Programación distribuida y en paralelo','Sistemas concurrentes y procesamiento paralelo.',4,1,1,'2026-05-03 21:56:11'), (31,'Estudio de las organizaciones','Estructura y funcionamiento empresarial.',4,1,1,'2026-05-03 21:56:11'), (32,'Arquitectura de computadoras','Diseño y funcionamiento del hardware.',4,1,1,'2026-05-03 21:56:11'), (33,'Administración de bases de datos','Gestión y optimización de bases de datos.',4,1,1,'2026-05-03 21:56:11'), (34,'Taller de desarrollo 2','Desarrollo práctico de proyectos de software.',4,1,1,'2026-05-03 21:56:11'),
(35,'Teoría matemática de la computación','Autómatas, lenguajes formales y complejidad.',5,1,1,'2026-05-03 21:57:49'), (36,'Investigación de operaciones','Optimización y toma de decisiones cuantitativas.',5,1,1,'2026-05-03 21:57:49'), (37,'Calidad en los procesos de desarrollo de software','Modelos y métricas para asegurar calidad.',5,1,1,'2026-05-03 21:57:49'), (38,'Traductores de bajo nivel','Compiladores, ensambladores y análisis léxico.',5,1,1,'2026-05-03 21:57:49'), (39,'Fundamentos de redes','Protocolos, modelos OSI y comunicación de datos.',5,1,1,'2026-05-03 21:57:49'), (40,'Tópicos avanzados de bases de datos','Optimización y tecnologías avanzadas de datos.',5,1,1,'2026-05-03 21:57:49'), (41,'Taller de desarrollo 3','Proyecto integrador de desarrollo de software.',5,1,1,'2026-05-03 21:57:49'),
(42,'Desarrollo de aplicaciones web y móviles','Creación de apps web y móviles.',7,1,1,'2026-05-03 21:58:36'), (43,'Sistemas operativos','Gestión de procesos, memoria y archivos.',7,1,1,'2026-05-03 21:58:36'), (44,'Conmutadores y redes inalámbricas','Configuración de switches y redes WiFi.',7,1,1,'2026-05-03 21:58:36'), (45,'Inteligencia artificial','Algoritmos inteligentes y aprendizaje automático.',7,1,1,'2026-05-03 21:58:36'),
(46,'Administración de sistemas operativos','Configuración y gestión avanzada de sistemas.',8,1,1,'2026-05-03 21:59:04'), (47,'Cómputo distribuido','Sistemas distribuidos y procesamiento remoto.',8,1,1,'2026-05-03 21:59:04'), (48,'Graficación','Modelado y renderizado de gráficos computacionales.',8,1,1,'2026-05-03 21:59:04'), (49,'Taller de investigación en las ciencias computacionales','Desarrollo de proyectos de investigación aplicada.',8,1,1,'2026-05-03 21:59:04'),
(50,'Taller de elaboración del informe de investigación','Redacción y presentación formal del proyecto final.',9,1,1,'2026-05-03 21:59:25');

-- =====================================================================
-- 3. BASE DE DATOS DE ASESORÍAS Y CALENDARIO (ADVISOR & CALENDAR SERVICE)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS asesor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asesor_db;

CREATE TABLE IF NOT EXISTS asesorias (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_auth INT NOT NULL,
    especialidad VARCHAR(200),
    area_especialidad VARCHAR(200),
    materias JSON,
    estado_aprobacion ENUM('Pendiente', 'Aprobado', 'Rechazado') DEFAULT 'Pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disponibilidades ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    id_perfil INT NOT NULL, 
    dia_semana VARCHAR(20) NOT NULL, 
    hora_inicio TIME, 
    hora_fin TIME, 
    activo BOOLEAN DEFAULT TRUE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_perfil) REFERENCES asesorias(id_perfil)
);

CREATE TABLE IF NOT EXISTS citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_perfil INT,
    id_usuario INT,
    fecha DATE,
    hora TIME,
    estado ENUM('reservada','cancelada') DEFAULT 'reservada',
    estado_qr ENUM('pendiente','completada') DEFAULT 'pendiente',
    token_qr VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_perfil) REFERENCES asesorias(id_perfil)
);

INSERT INTO asesorias (id_perfil, id_usuario_auth, especialidad, area_especialidad, materias, estado_aprobacion) VALUES 
(1, 3, 'Desarrollo Backend', 'Python y Arquitecturas Limpias', '[1, 2]', 'Aprobado'),
(2, 4, 'Infraestructura', 'Redes y Docker', '[3]', 'Aprobado');

INSERT INTO citas (id_perfil, id_usuario, fecha, hora, estado, estado_qr, token_qr) VALUES
(1, 5, '2026-05-10', '10:00:00', 'reservada', 'pendiente', 'token_falso_123'),
(2, 6, '2026-05-11', '12:00:00', 'reservada', 'pendiente', 'token_falso_456');

-- =====================================================================
-- 4. BASE DE DATOS DE RESEÑAS (REVIEW SERVICE)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS resenas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resenas_db;

CREATE TABLE IF NOT EXISTS resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_usuario_auth INT NOT NULL,
    id_materia INT NOT NULL,
    calificacion TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO resenas (id_resena, id_usuario, id_usuario_auth, id_materia, calificacion, comentario, estado) VALUES 
(1, 5, 3, 1, 5, 'Excelente asesoría, comprendí todo a la perfección.', 'aceptada'),
(2, 6, 3, 1, 1, 'Pésimo servicio, el asesor me gritó.', 'pendiente'),
(3, 6, 4, 3, 1, 'Visiten mi sitio web de apuestas deportivas para ganar dinero rápido.', 'pendiente');

-- =====================================================================
-- 5. BASE DE DATOS DE CONTENIDO (CONTENT SERVICE)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS content_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE content_db;

CREATE TABLE IF NOT EXISTS contenidos (
    id_contenido INT AUTO_INCREMENT PRIMARY KEY,
    id_perfil INT NOT NULL,    
    id_materia INT NOT NULL,    
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo VARCHAR(50),
    tamano INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO contenidos (id_contenido, id_perfil, id_materia, nombre_archivo, ruta_archivo, tipo, tamano) VALUES 
(1, 1, 1, 'Guia_Hexagonal_Python.pdf', '/storage/docs/guia_hex.pdf', 'application/pdf', 2048000),
(2, 2, 3, 'hack_redes_unach_free.exe', '/storage/docs/hack.exe', 'application/x-msdownload', 15000000);

-- =====================================================================
-- 6. BASE DE DATOS DE REPORTES (REPORT SERVICE)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS reportes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reportes_db;

CREATE TABLE IF NOT EXISTS reportes (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_reporta INT NOT NULL,
    id_usuario_objetivo INT NOT NULL,
    tipo_entidad ENUM('Usuario', 'Resena', 'Contenido', 'Fallo_Sistema', 'Otro') NOT NULL,
    id_entidad INT,
    motivo TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente', 
    prioridad ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO reportes (id_usuario_reporta, id_usuario_objetivo, tipo_entidad, id_entidad, motivo, estado, prioridad) VALUES 
(3, 6, 'Resena', 2, 'El alumno está mintiendo sobre mi actitud. La sesión está grabada.', 'Pendiente', 'Alta'),
(1, 6, 'Resena', 3, 'El estudiante está utilizando la sección de reseñas para publicar enlaces de SPAM.', 'En Revision', 'Media'),
(1, 4, 'Contenido', 2, 'El archivo subido parece ser un ejecutable malicioso o virus.', 'Pendiente', 'Alta');