import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiSearch, FiFilter, FiCalendar, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { Paginacion } from '../components/ui/Paginacion';
import { ModalGestorReporte } from '../components/ui/ModalGestorReporte';

export default function Reportes() {
  // 1. ESTADOS DE DATOS
  const [reportesBase, setReportesBase] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // 2. ESTADOS DE FILTRADO
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // 3. ESTADOS DE ORDENAMIENTO Y PAGINACIÓN
  const [ordenarPor, setOrdenarPor] = useState('created_at');
  const [ordenDireccion, setOrdenDireccion] = useState('desc'); // 'asc' o 'desc'
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  // Carga inicial
  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Asegúrate de que el endpoint /reportes exista en tu API Gateway
      const res = await axios.get('http://127.0.0.1:8000/reportes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReportesBase(res.data);
    } catch (err) {
      console.error("Error cargando reportes:", err);
      setError("No se pudieron cargar los reportes del servidor.");
    } finally {
      setCargando(false);
    }
  };

  // 4. PIPELINE DE PROCESAMIENTO (Filtro -> Orden -> Paginación)
  const { reportesProcesados, totalItems } = useMemo(() => {
    let resultado = [...reportesBase];

    // A. Filtrado por Búsqueda (ID o Motivo)
    if (busqueda) {
      const term = busqueda.toLowerCase();
      resultado = resultado.filter(r => 
        r.motivo.toLowerCase().includes(term) || 
        r.id_reporte.toString().includes(term)
      );
    }

    // B. Filtrado por Atributos
    if (filtroEstado !== 'Todos') resultado = resultado.filter(r => r.estado === filtroEstado);
    if (filtroPrioridad !== 'Todos') resultado = resultado.filter(r => r.prioridad === filtroPrioridad);
    if (filtroTipo !== 'Todos') resultado = resultado.filter(r => r.tipo_entidad === filtroTipo);

    // C. Filtrado por Fechas
    if (fechaInicio) {
      resultado = resultado.filter(r => new Date(r.created_at) >= new Date(fechaInicio));
    }
    if (fechaFin) {
      // Agregamos la hora 23:59:59 para incluir todo el día final
      resultado = resultado.filter(r => new Date(r.created_at) <= new Date(fechaFin + 'T23:59:59'));
    }

    // D. Ordenamiento Dinámico
    resultado.sort((a, b) => {
      let valA = a[ordenarPor];
      let valB = b[ordenarPor];
      
      if (valA < valB) return ordenDireccion === 'asc' ? -1 : 1;
      if (valA > valB) return ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });

    return {
      reportesProcesados: resultado,
      totalItems: resultado.length
    };
  }, [reportesBase, busqueda, filtroEstado, filtroPrioridad, filtroTipo, fechaInicio, fechaFin, ordenarPor, ordenDireccion]);

  // E. Paginación Final (Cortamos el array según la página actual)
  const reportesPaginados = useMemo(() => {
    const indiceInicio = (paginaActual - 1) * itemsPorPagina;
    return reportesProcesados.slice(indiceInicio, indiceInicio + itemsPorPagina);
  }, [reportesProcesados, paginaActual, itemsPorPagina]);

  // Resetear a la página 1 cada vez que cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, filtroPrioridad, filtroTipo, fechaInicio, fechaFin, itemsPorPagina]);

  // Función para cambiar orden al hacer clic en las cabeceras de la tabla
  const manejarOrden = (columna) => {
    if (ordenarPor === columna) {
      setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(columna);
      setOrdenDireccion('asc');
    }
  };

  const RenderIconoOrden = ({ columna }) => {
    if (ordenarPor !== columna) return <FiArrowDown className="opacity-20" />;
    return ordenDireccion === 'asc' ? <FiArrowUp className="text-primary" /> : <FiArrowDown className="text-primary" />;
  };

  const actualizarReporteEnTabla = (id, actualizaciones) => {
  setReportesBase(prev => prev.map(r => r.id_reporte === id ? { ...r, ...actualizaciones } : r));
};

  return (
    <div className="animate-fade-in max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Bandeja de Reportes</h1>
        <p className="text-on-surface/70 mt-1">Gestión avanzada, filtrado y monitoreo de incidencias.</p>
      </div>

      {/* PANEL DE CONTROL (Filtros y Búsqueda) */}
      <div className="bg-surface-lowest p-5 rounded-md shadow-cloud border border-outline-variant/20 flex flex-col gap-4">
        
        {/* Fila 1: Búsqueda y Filtros Principales */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/50" />
            <input 
              type="text" 
              placeholder="Buscar por ID o palabra en el motivo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-high/30 border border-outline-variant/30 rounded-md focus:border-primary outline-none text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="p-2 bg-surface-high/30 border border-outline-variant/30 rounded-md text-sm outline-none focus:border-primary">
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Resuelto">Resuelto</option>
            </select>
            <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} className="p-2 bg-surface-high/30 border border-outline-variant/30 rounded-md text-sm outline-none focus:border-primary">
              <option value="Todos">Toda Prioridad</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="p-2 bg-surface-high/30 border border-outline-variant/30 rounded-md text-sm outline-none focus:border-primary">
              <option value="Todos">Todo Tipo</option>
              <option value="Resena">Reseñas</option>
              <option value="Contenido">Archivos</option>
              <option value="Usuario">Usuarios</option>
            </select>
          </div>
        </div>

        {/* Fila 2: Filtro por Rango de Fechas */}
        <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
          <FiCalendar className="text-on-surface/50" />
          <span className="text-sm font-bold text-on-surface/70">Rango de fechas:</span>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)} 
            className="p-1.5 bg-surface-high/30 border border-outline-variant/30 rounded-md text-xs outline-none"
          />
          <span className="text-on-surface/50 text-sm">hasta</span>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)} 
            className="p-1.5 bg-surface-high/30 border border-outline-variant/30 rounded-md text-xs outline-none"
          />
          {(fechaInicio || fechaFin || busqueda || filtroEstado !== 'Todos' || filtroPrioridad !== 'Todos' || filtroTipo !== 'Todos') && (
            <button 
              onClick={() => {
                setBusqueda(''); setFiltroEstado('Todos'); setFiltroPrioridad('Todos'); setFiltroTipo('Todos'); setFechaInicio(''); setFechaFin('');
              }}
              className="ml-auto text-xs font-bold text-primary hover:underline"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-surface-lowest rounded-md shadow-cloud border border-outline-variant/20 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-high/40 text-[10px] text-on-surface/50 uppercase tracking-[0.2em] font-black border-b border-outline-variant/20">
                <th className="p-4 cursor-pointer hover:bg-surface-high/60 transition-colors" onClick={() => manejarOrden('id_reporte')}>
                  <div className="flex items-center gap-2">ID <RenderIconoOrden columna="id_reporte"/></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-surface-high/60 transition-colors" onClick={() => manejarOrden('tipo_entidad')}>
                  <div className="flex items-center gap-2">Entidad <RenderIconoOrden columna="tipo_entidad"/></div>
                </th>
                <th className="p-4 w-1/3">Motivo del Reporte</th>
                <th className="p-4 cursor-pointer hover:bg-surface-high/60 transition-colors" onClick={() => manejarOrden('prioridad')}>
                  <div className="flex items-center justify-center gap-2">Prioridad <RenderIconoOrden columna="prioridad"/></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-surface-high/60 transition-colors" onClick={() => manejarOrden('estado')}>
                  <div className="flex items-center justify-center gap-2">Estado <RenderIconoOrden columna="estado"/></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-surface-high/60 transition-colors" onClick={() => manejarOrden('created_at')}>
                  <div className="flex items-center justify-end gap-2">Fecha <RenderIconoOrden columna="created_at"/></div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {cargando ? (
                <tr><td colSpan="6" className="p-12 text-center text-xs font-bold text-on-surface/30 animate-pulse uppercase tracking-widest">Cargando reportes...</td></tr>
              ) : reportesPaginados.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-xs font-bold text-on-surface/30 uppercase tracking-widest">No se encontraron reportes con estos criterios</td></tr>
              ) : (
                reportesPaginados.map((reporte) => (
                  <tr key={reporte.id_reporte} onClick={() => setReporteSeleccionado(reporte)} className="border-b border-outline-variant/5 hover:bg-surface-high/20 transition-colors cursor-pointer">
                    <td className="p-4 font-mono text-xs text-on-surface/50">#{reporte.id_reporte}</td>
                    <td className="p-4">
                      <span className="bg-surface-high px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{reporte.tipo_entidad}</span>
                    </td>
                    <td className="p-4 text-on-surface/80">
                      <p className="line-clamp-2" title={reporte.motivo}>{reporte.motivo}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        reporte.prioridad === 'Alta' ? 'bg-error-container/50 text-on-error' : 
                        reporte.prioridad === 'Media' ? 'bg-[#fdf4e7] text-[#995c00]' : 'bg-surface-high text-on-surface/60'
                      }`}>
                        {reporte.prioridad}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 border rounded text-[10px] font-black uppercase tracking-widest ${
                        reporte.estado === 'Pendiente' ? 'border-on-error/30 text-on-error' : 
                        reporte.estado === 'Resuelto' ? 'border-success-container text-on-success' : 'border-outline-variant/30 text-on-surface/60'
                      }`}>
                        {reporte.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-xs text-on-surface/50">
                      {reporte.created_at.split(' ')[0]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!cargando && reportesProcesados.length > 0 && (
          <Paginacion 
            paginaActual={paginaActual}
            totalItems={totalItems}
            itemsPorPagina={itemsPorPagina}
            onCambiarPagina={setPaginaActual}
            onCambiarItemsPorPagina={setItemsPorPagina}
          />
        )}
      </div>

      {/* MODAL GESTOR DE REPORTES */}
      <ModalGestorReporte 
        reporteInicial={reporteSeleccionado}
        isOpen={!!reporteSeleccionado}
        onClose={() => setReporteSeleccionado(null)}
        onActualizarReporteEnTabla={actualizarReporteEnTabla}
      />
    </div>
  );
}