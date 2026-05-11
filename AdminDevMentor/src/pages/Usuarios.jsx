import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiSearch, FiFilter, FiShield, FiUser, FiAlertCircle } from 'react-icons/fi';
import { ModalDetalleUsuario } from '../components/ui/ModalDetalleUsuario';

export default function Usuarios() {
  // 1. ESTADOS PRINCIPALES
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorServidor, setErrorServidor] = useState(null);
  
  // 2. ESTADOS PARA BÚSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  
  // 3. ESTADO PARA EL MODAL DE DETALLE
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const [pendingCount, setPendingCount] = useState(0);

  const obtenerEstadoVisible = (user) => {
    if (user.rol === 'Asesor') {
      return user.estado_aprobacion || 'Pendiente';
    }

    return user.estado || 'Activo';
  };

  const obtenerClaseEstado = (user) => {
    const estadoVisible = obtenerEstadoVisible(user);

    if (user.rol === 'Asesor') {
      if (estadoVisible === 'Aprobado') {
        return 'bg-success-container/30 text-on-success';
      }

      if (estadoVisible === 'Rechazado') {
        return 'bg-on-error text-white shadow-sm';
      }

      return 'bg-warning-container/30 text-on-surface';
    }

    return estadoVisible === 'Activo'
      ? 'bg-success-container/30 text-on-success'
      : 'bg-on-error text-white shadow-sm';
  };

  const obtenerClaseFila = (user) => {
    if (user.rol === 'Asesor') {
      const estadoVisible = obtenerEstadoVisible(user);

      if (estadoVisible === 'Pendiente') {
        return 'bg-warning-container/5 hover:bg-warning-container/10';
      }

      if (estadoVisible === 'Rechazado') {
        return 'bg-error-container/5 grayscale-[0.35] opacity-85';
      }

      return 'hover:bg-primary/5 hover:scale-[1.002]';
    }

    return user.estado === 'Suspendido'
      ? 'bg-error-container/5 grayscale-[0.5] opacity-80'
      : 'hover:bg-primary/5 hover:scale-[1.002]';
  };

  const cargarPendientes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://127.0.0.1:8000/advisors/pending', { headers: { 'Authorization': `Bearer ${token}` } });
      setPendingCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (e) {
      setPendingCount(0);
    }
  };

  const cargarUsuarios = async () => {
    setCargando(true);
    setErrorServidor(null);
    try {
      const token = localStorage.getItem('adminToken');
      
      // LOG DE DEPURACIÓN PARA DESARROLLO
      console.log("Intentando conectar al Gateway con token:", token ? "Token presente" : "TOKEN FALTANTE");

      const [resUsuarios, resAsesores] = await Promise.allSettled([
        axios.get('http://127.0.0.1:8000/auth/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/advisors', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usuariosObtenidos = resUsuarios.status === 'fulfilled' ? resUsuarios.value.data || [] : [];
      const asesoresObtenidos = resAsesores.status === 'fulfilled' ? resAsesores.value.data || [] : [];
      const asesoresPorUsuario = new Map(asesoresObtenidos.map((asesor) => [asesor.id_usuario_auth, asesor]));

      const usuariosEnriquecidos = usuariosObtenidos.map((user) => {
        const asesor = asesoresPorUsuario.get(user.id_usuario);

        if (!asesor) {
          return user;
        }

        return {
          ...user,
          estado_aprobacion: asesor.estado_aprobacion || (asesor.aprobado ? 'Aprobado' : 'Pendiente'),
          id_perfil_asesor: asesor.id_perfil,
        };
      });

      console.log("Datos recibidos exitosamente:", usuariosEnriquecidos);
      setUsuarios(usuariosEnriquecidos);
      // También actualizar pendientes
      cargarPendientes();
    } catch (error) {
      console.error("Error detallado de la petición:", error);
      setErrorServidor(error.response?.data?.detail || error.message || "Error de comunicación con el API Gateway");
    } finally {
      setCargando(false);
    }
  };

  // 4. LÓGICA DE FILTRADO COMBINADO (Usa useMemo para optimizar el rendimiento)
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(user => {
      // Filtro A: Búsqueda por Nombre o Correo
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = user.nombre.toLowerCase().includes(termino) || 
                               user.correo.toLowerCase().includes(termino);
      
      // Filtro B: Por Rol Institucional
      const coincideRol = filtroRol === 'Todos' || user.rol === filtroRol;
      
      // Filtro C: Por Estado de Cuenta
      const coincideEstado = filtroEstado === 'Todos' || obtenerEstadoVisible(user) === filtroEstado;

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  // 5. FUNCIÓN PARA ACTUALIZAR ESTADO (SUSPENDER/ACTIVAR)
  const alternarEstadoUsuario = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://127.0.0.1:8000/auth/users/${id}/status`, 
        { estado: nuevoEstado },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Sincronizamos el estado local sin recargar toda la página
      const usuariosActualizados = usuarios.map(user => 
        user.id_usuario === id ? { ...user, estado: nuevoEstado } : user
      );
      setUsuarios(usuariosActualizados);

      // Si el modal está abierto con este usuario, actualizamos su vista interna
      if (usuarioSeleccionado && usuarioSeleccionado.id_usuario === id) {
        setUsuarioSeleccionado({ ...usuarioSeleccionado, estado: nuevoEstado });
      }
    } catch (error) {
      console.error("Error en la acción de moderación:", error);
      alert("No se pudo completar la acción. Verifique la conexión con el Auth Service.");
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      
      {/* ALERTA DE ERROR CRÍTICO */}
      {errorServidor && (
        <div className="mb-6 p-4 bg-error-container text-on-error rounded-md border border-on-error/20 flex items-start gap-3 shadow-sm">
          <FiAlertCircle size={24} className="flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">ERROR DE CONEXIÓN AL BACKEND</p>
            <p className="text-xs opacity-90">{errorServidor}</p>
            <button 
              onClick={cargarUsuarios}
              className="mt-2 text-[10px] font-black uppercase tracking-widest border border-on-error/30 px-2 py-1 rounded hover:bg-on-error hover:text-white transition-all"
            >
              Reintentar Conexión
            </button>
          </div>
        </div>
      )}

      {/* ENCABEZADO Y HERRAMIENTAS */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-on-surface tracking-tight">Directorio Administrativo</p>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center bg-error-container text-white text-xs font-black px-2 py-1 rounded">{pendingCount} pendientes</span>
            )}
          </div>
          <p className="text-on-surface/60 mt-1 text-sm font-medium">
            Gestión centralizada de cuentas para la plataforma AdminDevMentor.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1 min-w-[280px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo electrónico..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-lowest border border-outline-variant/30 rounded-md focus:border-primary outline-none text-sm transition-all shadow-sm"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select 
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-3 py-2.5 bg-surface-lowest border border-outline-variant/30 rounded-md text-xs font-bold text-on-surface/70 outline-none focus:border-primary cursor-pointer shadow-sm"
            >
              <option value="Todos">TODOS LOS ROLES</option>
              <option value="Estudiante">ESTUDIANTES</option>
              <option value="Asesor">ASESORES</option>
            </select>

            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2.5 bg-surface-lowest border border-outline-variant/30 rounded-md text-xs font-bold text-on-surface/70 outline-none focus:border-primary cursor-pointer shadow-sm"
            >
              <option value="Todos">CUALQUIER ESTADO</option>
              <option value="Activo">ACTIVOS</option>
              <option value="Suspendido">SUSPENDIDOS</option>
              <option value="Aprobado">APROBADOS</option>
              <option value="Pendiente">PENDIENTES</option>
              <option value="Rechazado">RECHAZADOS</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-surface-lowest rounded-md shadow-cloud overflow-hidden border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-high/30 text-[10px] text-on-surface/50 uppercase tracking-[0.2em] font-black border-b border-outline-variant/20">
              <th className="p-5">Información del Usuario</th>
              <th className="p-5 text-center">Rol</th>
              <th className="p-5 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {cargando ? (
              <tr><td colSpan="3" className="p-12 text-center text-xs font-bold text-on-surface/30 animate-pulse uppercase tracking-widest">Sincronizando con la base de datos...</td></tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr><td colSpan="3" className="p-12 text-center text-xs font-bold text-on-surface/30 uppercase tracking-widest">No se encontraron registros coincidentes</td></tr>
            ) : (
              usuariosFiltrados.map((user) => (
                <tr 
                  key={user.id_usuario} 
                  onClick={() => setUsuarioSeleccionado(user)}
                  className={`border-b border-outline-variant/5 cursor-pointer transition-all ${obtenerClaseFila(user)}`}
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.estado === 'Suspendido' ? 'bg-on-error/20 text-on-error' : 'bg-primary/10 text-primary'}`}>
                        {user.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${user.estado === 'Suspendido' ? 'text-on-surface/60 line-through' : 'text-on-surface'}`}>
                          {user.nombre}
                        </p>
                        <p className="text-[11px] text-on-surface/50 font-mono">{user.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      {user.rol === 'Asesor' ? <FiShield className="text-primary" /> : <FiUser className="text-on-surface/40" />}
                      <span className="font-bold text-xs text-on-surface/70 uppercase tracking-wider">{user.rol}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${obtenerClaseEstado(user)}`}>
                      {obtenerEstadoVisible(user)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALLE Y MODERACIÓN */}
      <ModalDetalleUsuario 
        usuario={usuarioSeleccionado} 
        isOpen={!!usuarioSeleccionado} 
        onClose={() => setUsuarioSeleccionado(null)}
        onActualizarEstado={alternarEstadoUsuario}
      />

    </div>
  );
}