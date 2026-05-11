import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiStar, FiXCircle } from 'react-icons/fi';

const API_BASE = 'http://127.0.0.1:8000';

const formatDate = (value) => {
  if (!value) return 'sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const normalizeResena = (resena) => ({
  id: resena.idResena,
  alumno: resena.nombreUsuario || `Usuario #${resena.idUsuario}`,
  asesor: resena.nombreAsesor || `Asesor #${resena.idUsuarioAuth || resena.idAsesor}`,
  materia: resena.idMateria ? `Materia #${resena.idMateria}` : 'Materia sin definir',
  calificacion: Number(resena.calificacion || 0),
  comentario: resena.comentario || 'Sin comentario',
  fecha: formatDate(resena.fechaCreacion),
  estado: resena.estado || 'pendiente'
});

export default function Resenas() {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [procesandoId, setProcesandoId] = useState(null);

  const cargarResenas = async () => {
    setCargando(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/resenas`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const rows = Array.isArray(res.data?.resenas) ? res.data.resenas : [];
      setResenas(rows.map(normalizeResena));
    } catch (err) {
      console.error('Error cargando reseñas:', err);
      setError('No se pudieron cargar las reseñas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarResenas();
  }, []);

  const resenasFiltradas = useMemo(() => {
    if (filtroEstado === 'Todos') return resenas;
    return resenas.filter((resena) => resena.estado === filtroEstado);
  }, [resenas, filtroEstado]);

  const aceptarResena = async (id) => {
    setProcesandoId(id);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API_BASE}/resenas/${id}/estado`,
        { estado: 'aceptada' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResenas((prev) => prev.map((resena) => (
        resena.id === id ? { ...resena, estado: 'aceptada' } : resena
      )));
    } catch (err) {
      console.error('Error aceptando reseña:', err);
      alert('No se pudo aceptar la reseña.');
    } finally {
      setProcesandoId(null);
    }
  };

  const rechazarResena = async (id) => {
    if (!window.confirm('¿Rechazar y eliminar esta reseña?')) return;
    setProcesandoId(id);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/resenas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResenas((prev) => prev.filter((resena) => resena.id !== id));
    } catch (err) {
      console.error('Error rechazando reseña:', err);
      alert('No se pudo rechazar la reseña.');
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Moderación de Reseñas</h1>
        <p className="text-on-surface/70 mt-2">Monitoreo del feedback de los estudiantes y gestión de comentarios reportados.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error rounded-md border border-on-error/20 text-sm">
          {error}
        </div>
      )}

      <div className="bg-surface-lowest p-4 rounded-md shadow-cloud border border-outline-variant/20 mb-6 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-on-surface/60 uppercase tracking-widest">Estado</span>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 bg-surface-high/30 border border-outline-variant/30 rounded-md text-xs font-bold text-on-surface/70 outline-none focus:border-primary"
        >
          <option value="Todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptada">Aceptada</option>
        </select>
        <button
          onClick={cargarResenas}
          className="ml-auto text-xs font-bold text-primary hover:underline"
        >
          Recargar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cargando && (
          <div className="col-span-full text-center text-xs font-bold text-on-surface/40 uppercase tracking-widest">
            Sincronizando reseñas...
          </div>
        )}

        {!cargando && resenasFiltradas.length === 0 && (
          <div className="col-span-full text-center text-xs font-bold text-on-surface/40 uppercase tracking-widest">
            No hay reseñas para mostrar
          </div>
        )}

        {!cargando && resenasFiltradas.map((resena) => (
          <div
            key={resena.id}
            className="bg-surface-lowest p-6 rounded-md shadow-cloud border-t-4 relative flex flex-col border-outline-variant/30"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-primary tracking-widest uppercase">{resena.materia}</p>
                <p className="text-sm font-medium text-on-surface mt-1">Para: {resena.asesor}</p>
                <p className="text-xs text-on-surface/60 mt-1">De: {resena.alumno}</p>
              </div>
              <div className="flex gap-1 text-[#995c00]">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} fill={i < resena.calificacion ? 'currentColor' : 'none'} size={14} />
                ))}
              </div>
            </div>

            <p className="text-sm text-on-surface/80 italic flex-1 mb-4">"{resena.comentario}"</p>

            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-on-surface/50">{resena.fecha}</span>
              <span className={`px-2 py-1 rounded-full ${resena.estado === 'aceptada' ? 'bg-success-container/40 text-on-success' : 'bg-[#fdf4e7] text-[#995c00]'}`}>
                {resena.estado}
              </span>
            </div>

            {resena.estado === 'pendiente' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-4">
                <button
                  onClick={() => rechazarResena(resena.id)}
                  disabled={procesandoId === resena.id}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-on-error bg-error-container/20 hover:bg-error-container/60 px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiXCircle size={14} /> Rechazar
                </button>
                <button
                  onClick={() => aceptarResena(resena.id)}
                  disabled={procesandoId === resena.id}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-on-success bg-success-container/40 hover:bg-success-container/70 px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCheck size={14} /> Aceptar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}