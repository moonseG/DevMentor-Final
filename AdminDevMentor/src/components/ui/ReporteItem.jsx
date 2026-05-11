import React, { useState } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiFileText, FiUser, FiTrash2, FiPower, FiXCircle } from 'react-icons/fi';

export const ReporteItem = ({ reporte, usuario, onActualizarReporteLocal }) => {
  const [procesando, setProcesando] = useState(false);

  const IconoEntidad = 
    reporte.tipo_entidad === 'Resena' ? FiMessageSquare : 
    reporte.tipo_entidad === 'Contenido' ? FiFileText : FiUser;

  // Función genérica para cambiar el estado en el backend
  const cambiarEstadoBD = async (nuevoEstado) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://127.0.0.1:8000/reportes/${reporte.id_reporte}/estado`, 
        { estado: nuevoEstado },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Notificamos al componente padre (Modal) para que actualice la UI
      onActualizarReporteLocal(reporte.id_reporte, { estado: nuevoEstado });
      return true;
    } catch (error) {
      console.error("Error al cambiar estado del reporte:", error);
      alert("Hubo un error al actualizar el estado del reporte.");
      return false;
    }
  };

  // 1. Cambio manual (Pendiente <-> En Revisión)
  const handleSelectEstado = (e) => {
    const nuevoEstado = e.target.value;
    cambiarEstadoBD(nuevoEstado);
  };

  // 2. Acción: Rechazar Reporte (Falso positivo)
  const handleRechazar = async () => {
    if (!window.confirm("¿Marcar este reporte como rechazado (falsa alarma)?")) return;
    setProcesando(true);
    await cambiarEstadoBD('Rechazado');
    setProcesando(false);
  };

  // 3. Acción Punitiva: Eliminar Contenido -> Pasa a Resuelto
  const handleEliminarConResolucion = async () => {
    if (!window.confirm(`¿Eliminar permanentemente este(a) ${reporte.tipo_entidad}?`)) return;
    setProcesando(true);
    try {
      const token = localStorage.getItem('adminToken');
      const url = reporte.tipo_entidad === 'Resena' ? `/resenas/${reporte.id_entidad}` : `/contents/${reporte.id_entidad}`;
      await axios.delete(`http://127.0.0.1:8000${url}`, { headers: { 'Authorization': `Bearer ${token}` } });
      
      // Eliminación exitosa: Auto-resolvemos el reporte
      await cambiarEstadoBD('Resuelto');
      onActualizarReporteLocal(reporte.id_reporte, { detalleExtra: null }); // Quitamos la evidencia visual
      alert("Contenido eliminado y reporte resuelto.");
    } catch (e) {
      alert("Error al eliminar el contenido.");
    } finally {
      setProcesando(false);
    }
  };

  // 4. Acción Punitiva: Suspender Usuario -> Pasa a Resuelto
  const handleSuspenderConResolucion = async () => {
    if (!window.confirm("¿Suspender a este usuario?")) return;
    setProcesando(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://127.0.0.1:8000/auth/users/${usuario.id_usuario}/status`, 
        { estado: 'Suspendido' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Suspensión exitosa: Auto-resolvemos el reporte
      await cambiarEstadoBD('Resuelto');
      alert("Usuario suspendido y reporte resuelto.");
    } catch (e) {
      alert("Error al suspender al usuario.");
    } finally {
      setProcesando(false);
    }
  };

  // Renderizado dinámico de la evidencia
  const renderEvidencia = () => {
    if (reporte.tipo_entidad === 'Resena' && reporte.detalleExtra) {
      return (
        <div className="bg-surface-high/30 p-3 rounded mt-3 border-l-2 border-primary/50">
          <p className="text-sm italic text-on-surface/90">"{reporte.detalleExtra.comentario}"</p>
          <p className="text-[10px] font-bold mt-2 text-on-surface/50 uppercase">Calificación: {reporte.detalleExtra.calificacion} ⭐</p>
        </div>
      );
    }
    if (reporte.tipo_entidad === 'Contenido' && reporte.detalleExtra) {
      return (
        <div className="bg-surface-high/30 p-3 rounded mt-3 border-l-2 border-[#995c00]/50">
          <p className="text-sm font-mono text-on-surface/90">{reporte.detalleExtra.nombre_archivo}</p>
          <p className="text-[10px] font-bold mt-1 text-on-surface/50 uppercase">Tipo: {reporte.detalleExtra.tipo}</p>
        </div>
      );
    }
    if (!reporte.detalleExtra && (reporte.tipo_entidad === 'Resena' || reporte.tipo_entidad === 'Contenido')) {
      return <div className="bg-surface-high/10 p-3 rounded mt-3 text-sm text-on-surface/40 italic">Contenido eliminado.</div>;
    }
    return null;
  };

  // Determinar si los botones punitivos deben estar bloqueados
  const bloqueado = procesando || reporte.estado === 'Resuelto' || reporte.estado === 'Rechazado';

  return (
    <div className={`border rounded-md p-5 shadow-sm transition-all ${
      reporte.estado === 'Resuelto' ? 'border-success-container/50 bg-success-container/5' :
      reporte.estado === 'Rechazado' ? 'border-outline-variant/20 bg-surface-lowest opacity-70' : 
      'border-outline-variant/30 bg-surface-lowest hover:border-primary/30'
    }`}>
      
      {/* Cabecera del Reporte y Selector de Estado */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
        <div className="flex items-center gap-2">
          <IconoEntidad className={reporte.tipo_entidad === 'Resena' ? 'text-primary' : reporte.tipo_entidad === 'Contenido' ? 'text-[#995c00]' : 'text-on-error'} />
          <span className="text-[10px] font-black uppercase tracking-widest bg-surface-high px-2 py-1 rounded">
            Reporte #{reporte.id_reporte}
          </span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${reporte.prioridad === 'Alta' ? 'bg-error-container text-on-error' : 'bg-surface-high text-on-surface/60'}`}>
            {reporte.prioridad}
          </span>
        </div>

        {/* SELECTOR DE ESTADO (Solo permite alternar entre Pendiente y En Revisión manualmente) */}
        <div className="flex items-center gap-2">
          {reporte.estado === 'Resuelto' || reporte.estado === 'Rechazado' ? (
            <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${reporte.estado === 'Resuelto' ? 'bg-success-container text-on-success' : 'bg-surface-high text-on-surface/60'}`}>
              {reporte.estado}
            </span>
          ) : (
            <select 
              value={reporte.estado}
              onChange={handleSelectEstado}
              disabled={procesando}
              className="text-xs font-bold bg-surface-high/30 border border-outline-variant/30 rounded px-2 py-1 outline-none focus:border-primary cursor-pointer"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
            </select>
          )}
        </div>
      </div>
      
      <p className="text-sm text-on-surface/90">
        <span className="font-bold text-on-surface/50 uppercase text-xs tracking-wider mr-2">Motivo:</span> 
        {reporte.motivo}
      </p>

      {renderEvidencia()}

      {/* Botones de Moderación */}
      <div className="flex flex-wrap justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/10">
        {!bloqueado && (
          <button 
            onClick={handleRechazar}
            className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface/60 hover:text-on-surface hover:bg-surface-high px-3 py-1.5 rounded transition-colors"
          >
            <FiXCircle size={14} /> RECHAZAR REPORTE
          </button>
        )}

        {reporte.tipo_entidad === 'Usuario' ? (
          <button 
            onClick={handleSuspenderConResolucion}
            disabled={bloqueado || (usuario && usuario.estado === 'Suspendido')}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-on-error hover:bg-on-error/90 px-3 py-1.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPower size={14} /> SUSPENDER Y RESOLVER
          </button>
        ) : (
          <button 
            onClick={handleEliminarConResolucion}
            disabled={bloqueado || !reporte.detalleExtra}
            className="flex items-center gap-1.5 text-[11px] font-bold text-on-error bg-error-container/20 hover:bg-error-container/60 px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={14} /> ELIMINAR Y RESOLVER
          </button>
        )}
      </div>
    </div>
  );
};