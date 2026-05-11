import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. IMPORTACIÓN DE PÁGINAS
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Configuracion from './pages/Configuracion';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Resenas from './pages/Resenas';

// 2. IMPORTACIÓN DE LAYOUTS
import MainLayout from './layouts/MainLayout';

/**
 * Componente de Seguridad (Guardia)
 * Verifica si existe una sesión administrativa activa en el navegador.
 */
const RutaProtegida = ({ children }) => {
  const adminGuardado = localStorage.getItem('adminUser');
  
  if (!adminGuardado) {
    // Si no se detecta el objeto de sesión, se redirige al login
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==========================================
            RUTAS PÚBLICAS
            ========================================== */}
        <Route path="/login" element={<Login />} />

        {/* ==========================================
            RUTAS PRIVADAS (Protegidas)
            Envueltas en el Layout persistente del Sidebar
            ========================================== */}
        <Route 
          path="/" 
          element={
            <RutaProtegida>
              <MainLayout />
            </RutaProtegida>
          }
        >
          {/* Redirección inicial al Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Vistas principales del Administrador */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="resenas" element={<Resenas />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
        
        {/* ==========================================
            MANEJO DE RUTAS NO EXISTENTES (404)
            ========================================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;