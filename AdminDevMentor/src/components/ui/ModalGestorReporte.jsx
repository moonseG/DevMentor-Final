import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { ReporteItem } from './ReporteItem';

export const ModalGestorReporte = ({ reporteInicial, isOpen, onClose, onActualizarReporteEnTabla }) => {
  const [reporteCompleto, setReporteCompleto] = useState(null);
  const [usuarioObjetivo, setUsuarioObjetivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (isOpen && reporteInicial) {
      cargarContexto(reporteInicial);
    }
  }, [isOpen, reporteInicial]);

  const cargarContexto = async (rep) => {
    setCargando(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      let reporteEnriquecido = { ...rep };

      // OBTENEMOS EL USUARIO
      const resUsuarios = await axios.get('http://127.0.0.1:8000/auth/users', config);
      const usuarioEncontrado = resUsuarios.data.find(u => u.id_usuario === rep.id_usuario_objetivo);
      setUsuarioObjetivo(usuarioEncontrado);

      // OBTENEMOS LA EVIDENCIA (Añadimos validación para evitar el error 422 de "undefined")
      if (rep.id_usuario_objetivo) {
        if (rep.tipo_entidad === 'Resena') {
          const resResenas = await axios.get(`http://127.0.0.1:8000/resenas?idUsuario=${rep.id_usuario_objetivo}`, config);
          reporteEnriquecido.detalleExtra = resResenas.data.resenas.find(r => r.idResena === rep.id_entidad) || null;
        } else if (rep.tipo_entidad === 'Contenido') {
          const resContenidos = await axios.get(`http://127.0.0.1:8000/contents/perfil/${rep.id_usuario_objetivo}`, config);
          reporteEnriquecido.detalleExtra = resContenidos.data.find(c => c.id_contenido === rep.id_entidad) || null;
        }
      }

      setReporteCompleto(reporteEnriquecido);
    } catch (error) {
      console.error("Error al cargar contexto del reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleActualizarReporteLocal = (id_reporte, actualizaciones) => {
    setReporteCompleto(prev => ({ ...prev, ...actualizaciones }));
    onActualizarReporteEnTabla(id_reporte, actualizaciones);
  };

  if (!isOpen || !reporteInicial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-surface-lowest w-full max-w-2xl rounded-md shadow-cloud flex flex-col max-h-[90vh]">
        
        {/* Cabecera genérica siempre visible */}
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-high/10">
          <h2 className="text-lg font-bold text-on-surface uppercase tracking-wider">Gestión de Reporte</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-high rounded-full"><FiX size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest">Recopilando evidencia...</span>
            </div>
          ) : (
            <>
              {/* Mostramos la información del usuario SÓLO cuando ya cargó */}
              <div className="flex gap-4 items-center mb-6 p-4 bg-surface-high/5 rounded border border-outline-variant/10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${usuarioObjetivo?.estado === 'Suspendido' ? 'bg-error-container text-on-error' : 'bg-primary/10 text-primary'}`}>
                  {usuarioObjetivo?.nombre?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface flex items-center gap-2">
                    {usuarioObjetivo?.nombre || 'Usuario no encontrado'}
                    {usuarioObjetivo?.estado === 'Suspendido' && <span className="text-[10px] bg-on-error text-white px-2 py-0.5 rounded uppercase tracking-wider">Suspendido</span>}
                  </h3>
                  <p className="text-xs text-on-surface/60 font-mono">{usuarioObjetivo?.correo || 'Sin correo'}</p>
                </div>
              </div>

              {/* El componente del reporte */}
              <ReporteItem 
                reporte={reporteCompleto}
                usuario={usuarioObjetivo}
                onActualizarReporteLocal={handleActualizarReporteLocal}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};