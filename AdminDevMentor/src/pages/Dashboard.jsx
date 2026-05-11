import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiClock, FiUserX, FiCheckCircle, FiCode } from 'react-icons/fi';
import { NuevoLenguajeModal } from '../components/ui/NuevoLenguajeModal';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  // 1. ESTADOS DE REACT PARA MANEJAR LA API (Nuestro código)
  const [lenguajes, setLenguajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [resenas, setResenas] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroTiempo, setFiltroTiempo] = useState('Mes'); 

  // 2. ESTADOS PARA EL MODAL (Código de los compañeros)
  const [modalOpen, setModalOpen] = useState(false);
  const [lenguajeSeleccionado, setLenguajeSeleccionado] = useState(null);

  // 3. PETICIÓN PROTEGIDA AL BACKEND (Combinado y extraído)
  // Lo extraemos del useEffect para que el Modal pueda usarlo en su evento "onSuccess"
  const cargarDatosDashboard = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resLenguajes, resUsuarios, resReportes, resResenas] = await Promise.all([
        axios.get('http://127.0.0.1:8000/lenguajes', config).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/auth/users', config).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/reportes', config).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/resenas', config).catch(() => ({ data: { resenas: [] } }))
      ]);
      
      setLenguajes(resLenguajes.data || []);
      setUsuarios(resUsuarios.data || []);
      setReportes(Array.isArray(resReportes.data) ? resReportes.data : (resReportes.data.reportes || []));
      setResenas(Array.isArray(resResenas.data.resenas) ? resResenas.data.resenas : []);
      
    } catch (err) {
      console.error("Error conectando con el backend:", err);
      setError('No se pudieron cargar todos los datos en tiempo real.');
    } finally {
      setCargando(false);
    }
  };

  // Se ejecuta automáticamente al abrir la página
  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  // 4. LÓGICA DEL FILTRO DE TIEMPO (Nuestro código)
  const isWithinFilter = (dateStr, filter) => {
    if (!dateStr) return true; 
    const safeDateStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
    const d = new Date(safeDateStr);
    if (isNaN(d.getTime())) return true;

    const now = new Date();
    if (filter === 'Hoy') {
      return d.toDateString() === now.toDateString();
    }
    if (filter === 'Semana') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      return d >= startOfWeek;
    }
    if (filter === 'Mes') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // 5. CÁLCULO DINÁMICO DE MÉTRICAS (Nuestro código)
  const metricas = useMemo(() => {
    const usuariosFiltrados = usuarios.filter(u => isWithinFilter(u.fecha_registro, filtroTiempo));
    const reportesFiltrados = reportes.filter(r => isWithinFilter(r.created_at || r.createdAt, filtroTiempo));
    const resenasFiltradas = resenas.filter(r => isWithinFilter(r.fechaCreacion || r.fecha_creacion, filtroTiempo));

    const suspendidos = usuariosFiltrados.filter(u => u.estado === 'Suspendido').length;
    const reportesPendientes = reportesFiltrados.filter(r => r.estado === 'Pendiente' || r.estado === 'En Revision').length;
    const reportesResueltos = reportesFiltrados.filter(r => r.estado !== 'Pendiente' && r.estado !== 'En Revision').length;
    const resenasPendientes = resenasFiltradas.filter(r => r.estado === 'pendiente').length;

    return {
      suspendidos,
      reportesPendientes,
      reportesResueltos,
      tareasTotalesPendientes: reportesPendientes + resenasPendientes
    };
  }, [usuarios, reportes, resenas, filtroTiempo]);

  const getFilterClass = (filterName) => {
    return filtroTiempo === filterName 
      ? "px-4 py-1.5 text-sm font-medium rounded bg-surface-lowest shadow-sm text-on-surface" 
      : "px-4 py-1.5 text-sm font-medium rounded text-on-surface/70 hover:text-on-surface transition-colors";
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Panel General</h1>
          <p className="text-on-surface/70 mt-1">
            Bienvenido, Admin. Tienes <span className="font-semibold text-primary">{metricas.tareasTotalesPendientes} tareas</span> pendientes para {filtroTiempo.toLowerCase()}.
          </p>
        </div>
        
        <div className="flex bg-surface-high rounded-md p-1">
          <button onClick={() => setFiltroTiempo('Hoy')} className={getFilterClass('Hoy')}>Hoy</button>
          <button onClick={() => setFiltroTiempo('Semana')} className={getFilterClass('Semana')}>Esta Semana</button>
          <button onClick={() => setFiltroTiempo('Mes')} className={getFilterClass('Mes')}>Mes</button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/50 text-on-error rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {/* Grid Principal sin la columna inútil */}
      <div className="flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-lowest p-6 rounded-md shadow-cloud border-t-4 border-success">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-success tracking-widest bg-success/10 px-2 py-1 rounded uppercase">Reportes Resueltos</span>
              <FiCheckCircle className="text-success" size={20} />
            </div>
            <h2 className="text-4xl font-black text-on-surface tracking-tighter">
              {cargando ? '-' : metricas.reportesResueltos}
            </h2>
            <p className="text-sm text-on-surface/70 mt-2">Casos solucionados</p>
          </div>

          <div className="bg-[#fdf4e7] p-6 rounded-md shadow-cloud border-t-4 border-[#995c00]">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-[#995c00] tracking-widest uppercase bg-[#995c00]/10 px-2 py-1 rounded">En Espera</span>
              <FiClock className="text-[#995c00]" size={20} />
            </div>
            <h2 className="text-4xl font-black text-[#995c00] tracking-tighter">
              {cargando ? '-' : metricas.reportesPendientes}
            </h2>
            <p className="text-sm text-[#995c00]/80 mt-2">Reportes sin atender</p>
          </div>

          <div className="bg-error-container/40 p-6 rounded-md shadow-cloud border-t-4 border-on-error">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-on-error tracking-widest uppercase bg-on-error/10 px-2 py-1 rounded">Suspensiones</span>
              <FiUserX className="text-on-error" size={20} />
            </div>
            <h2 className="text-4xl font-black text-on-error tracking-tighter">
              {cargando ? '-' : metricas.suspendidos}
            </h2>
            <p className="text-sm text-on-error/80 mt-2">Cuentas bloqueadas</p>
          </div>
        </div>

        {/* TABLA DE LENGUAJES CON EL BOTÓN DE LOS COMPAÑEROS */}
        <div className="bg-surface-lowest p-6 rounded-md shadow-cloud mt-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-on-surface">Lenguajes de Programación Activos</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Vía API Gateway</span>
              {/* Botón de los compañeros integrado aquí */}
              <Button onClick={() => { setLenguajeSeleccionado(null); setModalOpen(true); }}>
                + Agregar Lenguaje
              </Button>
            </div>
          </div>
          
          {cargando ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-12 bg-surface-high rounded-md w-full"></div>
              <div className="h-12 bg-surface-high rounded-md w-full"></div>
            </div>
          ) : lenguajes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {lenguajes.map((lenguaje) => (
                <div key={lenguaje.id} className="flex items-center justify-between p-3 hover:bg-surface-high rounded-md transition-colors border-b border-outline-variant/10 last:border-0">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      <FiCode size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{lenguaje.nombre}</p>
                      <p className="text-xs text-on-surface/50 font-mono">ID: {lenguaje.id}</p>
                    </div>
                  </div>
                  <div className="w-1/2 text-sm text-on-surface/80">{lenguaje.descripcion}</div>
                  <div className="w-1/4 text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${lenguaje.activo ? 'text-on-success bg-success-container/50' : 'text-on-error bg-error-container/50'}`}>
                      {lenguaje.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-on-surface/60">
              No hay lenguajes registrados en la base de datos.
            </div>
          )}
        </div>
      </div>

      {/* Modal integrado de los compañeros */}
      <NuevoLenguajeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lenguaje={lenguajeSeleccionado}
        onSuccess={cargarDatosDashboard}
      />
    </div>
  );
}