import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiShield, FiUser, FiCalendar, FiPhone, FiPower } from 'react-icons/fi';
import { ReporteItem } from './ReporteItem';

export const ModalDetalleUsuario = ({ usuario, isOpen, onClose, onActualizarEstado }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [advisorProfile, setAdvisorProfile] = useState(null);

  useEffect(() => {
    if (isOpen && usuario) {
      obtenerDatosEnriquecidos();
    }
  }, [isOpen, usuario]);

  const obtenerDatosEnriquecidos = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const id = usuario.id_usuario;

      // Peticiones en paralelo al Gateway
      const [resReportes, resResenasAutor, resResenasAsesor, resContenidos] = await Promise.allSettled([
        axios.get(`http://127.0.0.1:8000/reportes/usuario/${id}`, config),
        axios.get(`http://127.0.0.1:8000/resenas?idUsuario=${id}`, config),
        axios.get(`http://127.0.0.1:8000/resenas?idUsuarioAuth=${id}`, config),
        axios.get(`http://127.0.0.1:8000/contents/perfil/${id}`, config)
      ]);

      // Extraer datos si las peticiones fueron exitosas
      const reportesBase = resReportes.status === 'fulfilled' ? resReportes.value.data : [];
      const resenasHechas = resResenasAutor.status === 'fulfilled' ? resResenasAutor.value.data.resenas : [];
      const resenasRecibidas = resResenasAsesor.status === 'fulfilled' ? resResenasAsesor.value.data.resenas : [];
      const contenidosObtenidos = resContenidos.status === 'fulfilled' ? resContenidos.value.data : [];

      const todasLasResenas = [...resenasHechas, ...resenasRecibidas];

      // Mapeo: Inyectar la evidencia real en el reporte correspondiente
      const reportesEnriquecidos = reportesBase.map(rep => {
        let detalleExtra = null;
        if (rep.tipo_entidad === 'Resena') {
          detalleExtra = todasLasResenas.find(r => r.idResena === rep.id_entidad);
        } else if (rep.tipo_entidad === 'Contenido') {
          detalleExtra = contenidosObtenidos.find(c => c.id_contenido === rep.id_entidad);
        }
        return { ...rep, detalleExtra };
      });

      setReportes(reportesEnriquecidos);
      // Si el usuario es Asesor, intentar traer su perfil de advisor
      if (usuario.rol === 'Asesor') {
        try {
          const resAdvisor = await axios.get(`http://127.0.0.1:8000/advisors/user/${id}`, config);
          setAdvisorProfile(resAdvisor.data);
        } catch (e) {
          setAdvisorProfile(null);
        }
      }
    } catch (error) {
      console.error("Error cargando datos agregados:", error);
      setReportes([]);
    } finally {
      setCargando(false);
    }
  };

  const handleApproveAdvisor = async (aprobado) => {
    if (!advisorProfile) return alert('No se encontró el perfil de asesor');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`http://127.0.0.1:8000/advisors/${advisorProfile.id_perfil}/approve`, { aprobado }, { headers: { 'Authorization': `Bearer ${token}` } });
      alert(aprobado ? 'Asesor aprobado' : 'Asesor rechazado');
      setAdvisorProfile(res.data);
    } catch (e) {
      console.error(e);
      alert('No se pudo actualizar el estado del asesor.');
    }
  };

  const manejarEliminacion = async (tipo, id_entidad) => {
    if (!window.confirm("Esta acción eliminará el contenido permanentemente. ¿Deseas continuar?")) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const url = tipo === 'Resena' ? `/resenas/${id_entidad}` : `/contents/${id_entidad}`;
      
      await axios.delete(`http://127.0.0.1:8000${url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Actualiza la UI marcando que ya no hay detalle (evita volver a hacer peticiones)
      setReportes(reportes.map(r => 
        r.id_entidad === id_entidad ? { ...r, detalleExtra: null } : r
      ));
      
      alert(`${tipo} eliminada del sistema con éxito.`);
    } catch (e) {
      alert("Ocurrió un error al intentar eliminar el contenido.");
    }
  };

  if (!isOpen || !usuario) return null;

  const estadoAprobacion = advisorProfile?.estado_aprobacion || (advisorProfile?.aprobado ? 'Aprobado' : 'Pendiente');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-surface-lowest w-full max-w-3xl rounded-md shadow-cloud flex flex-col max-h-[85vh]">
        
        {/* Cabecera Principal */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${usuario.estado === 'Suspendido' ? 'bg-error-container text-on-error' : 'bg-primary/10 text-primary'}`}>
              {usuario.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
                {usuario.nombre}
                {usuario.estado === 'Suspendido' && <span className="text-[10px] bg-on-error text-white px-2 py-0.5 rounded uppercase tracking-wider">Suspendido</span>}
              </h2>
              <p className="text-sm text-on-surface/60 font-mono">{usuario.correo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-high rounded-full transition-colors"><FiX size={20}/></button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex px-6 border-b border-outline-variant/20">
          <button onClick={() => setActiveTab('info')} className={`py-4 px-6 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-on-surface/40 hover:text-on-surface/80'}`}>Perfil General</button>
          <button onClick={() => setActiveTab('logs')} className={`py-4 px-6 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'logs' ? 'text-primary border-b-2 border-primary' : 'text-on-surface/40 hover:text-on-surface/80'}`}>Historial de Reportes ({reportes.length})</button>
        </div>

        {/* Contenido Dinámico */}
        <div className="p-6 overflow-y-auto bg-surface-high/5">
          {activeTab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="flex items-center gap-3 p-4 bg-surface-lowest rounded-md shadow-sm border border-outline-variant/10">
                <FiShield className="text-primary" size={24}/>
                <div>
                  <p className="text-[10px] font-bold text-on-surface/40 uppercase">Rol Institucional</p>
                  <p className="text-sm font-bold text-on-surface">{usuario.rol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-lowest rounded-md shadow-sm border border-outline-variant/10">
                <FiPhone className="text-primary" size={24}/>
                <div>
                  <p className="text-[10px] font-bold text-on-surface/40 uppercase">Teléfono Registrado</p>
                  <p className="text-sm font-bold text-on-surface">{usuario.telefono || 'Sin teléfono'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-lowest rounded-md shadow-sm border border-outline-variant/10">
                <FiCalendar className="text-primary" size={24}/>
                <div>
                  <p className="text-[10px] font-bold text-on-surface/40 uppercase">Fecha de Ingreso</p>
                  <p className="text-sm font-bold text-on-surface">{usuario.fecha_registro}</p>
                </div>
              </div>
              
              <div className="md:col-span-2 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={() => onActualizarEstado(usuario.id_usuario, usuario.estado)}
                    className={`w-full py-4 rounded-md font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      usuario.estado === 'Activo' ? 'bg-error-container/50 text-on-error hover:bg-error-container' : 'bg-success-container/50 text-on-success hover:bg-success-container'
                    }`}
                  >
                    <FiPower size={16}/> {usuario.estado === 'Activo' ? 'Suspender Acceso' : 'Restaurar Acceso'}
                  </button>

                  {usuario.rol === 'Asesor' && (
                    <div>
                      <p className="text-[10px] font-bold text-on-surface/40 uppercase mb-2">Aprobación de Asesor</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveAdvisor(true)} className={`flex-1 py-3 rounded-md font-black text-xs uppercase tracking-widest bg-success-container/30 text-on-success`}>Aprobar</button>
                        <button onClick={() => handleApproveAdvisor(false)} className={`flex-1 py-3 rounded-md font-black text-xs uppercase tracking-widest bg-error-container/30 text-on-error`}>Rechazar</button>
                      </div>
                      {advisorProfile && (
                        <p className="mt-2 text-[11px] text-on-surface/60">Estado: {estadoAprobacion}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-fade-in">
              {cargando ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-on-surface/60 uppercase tracking-widest">Recopilando evidencia...</p>
                </div>
              ) : reportes.length > 0 ? (
                reportes.map(r => (
                  <ReporteItem 
                    key={r.id_reporte} 
                    reporte={r} 
                    usuario={usuario}
                    onEliminar={manejarEliminacion} 
                    onSuspender={onActualizarEstado}
                  />
                ))
              ) : (
                <p className="text-center py-12 text-xs font-bold text-on-surface/30 uppercase tracking-widest border-2 border-dashed border-outline-variant/20 rounded-md">
                  El usuario cuenta con un historial limpio
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};