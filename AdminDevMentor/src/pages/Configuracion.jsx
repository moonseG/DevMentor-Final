import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { NuevaMateriaModal } from '../components/ui/NuevaMateriaModal';

export default function Configuracion() {
  //const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('catalogo'); // 'catalogo' o 'moderacion'

  const [materiasOficiales, setMateriasOficiales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  const [mensaje, setMensaje] = useState("");
 

  const toggleEstado = async (materia) => {
    try {
      const nuevoEstado = Number(materia.activa) === 1 ? false : true;

      const response = await fetch(
        `http://localhost:8002/materias/${materia.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: materia.nombre,
            carrera_id: materia.carrera_id,
            activa: nuevoEstado
          })
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar");
      }

      const updated = await response.json();

      setMateriasOficiales((prev) =>
        prev.map((m) =>
          m.id === materia.id
            ? { ...m, activa: updated.activa ? 1 : 0 }
            : m
        )
      );
      setMensaje("Estado actualizado correctamente");

      setTimeout(() => {
        setMensaje("");
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdicionExitosa = async () => {
    setMensaje("Materia actualizada correctamente");

    setTimeout(() => {
      setMensaje("");
    }, 3000);

    const response = await fetch("http://localhost:8002/materias");
    const data = await response.json();
    setMateriasOficiales(data);
  };

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const response = await fetch("http://localhost:8002/materias");

        if (!response.ok) throw new Error("Error al obtener materias");

        const data = await response.json();

        setMateriasOficiales(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      
      {/* Encabezado Principal */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Configuración del Sistema</h1>
        <p className="text-on-surface/70 mt-2">
          Administración de catálogos, reglas de moderación y parámetros globales.
        </p>
      </div>

      {/* Pestañas (Tabs) */}
      <div className="flex gap-6 border-b border-outline-variant/20 mb-8">
        <button 
          onClick={() => setActiveTab('catalogo')}
          className={`pb-3 text-sm font-bold transition-all ${
            activeTab === 'catalogo' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface/50 hover:text-on-surface'
          }`}
        >
          Catálogo Académico
        </button>
        <button 
          onClick={() => setActiveTab('moderacion')}
          className={`pb-3 text-sm font-bold transition-all ${
            activeTab === 'moderacion' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface/50 hover:text-on-surface'
          }`}
        >
          Moderación Automática
        </button>
      </div>

      {/* Contenido de la pestaña actual */}
      {activeTab === 'catalogo' && (
        <div className="bg-surface-lowest p-8 rounded-md shadow-cloud">

          {mensaje && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 font-medium">
              {mensaje}
            </div>
          )}
          
          {/* Cabecera de la tabla */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-on-surface">Materias Oficiales</h2>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + Agregar Materia
            </Button>
          </div>

          {/* Tabla */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-high/50 text-xs text-on-surface/60 uppercase tracking-wider">
                  <th className="p-4 font-bold rounded-tl-md">ID</th>
                  <th className="p-4 font-bold">NOMBRE DE LA MATERIA</th>
                  <th className="p-4 font-bold">CARRERA</th>
                  <th className="p-4 font-bold">ESTADO</th>
                  <th className="p-4 font-bold text-right rounded-tr-md">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {materiasOficiales.map((materia, index) => (
                  <tr key={index} className="border-b border-outline-variant/10 hover:bg-surface-high/20 transition-colors">
                    <td className="p-4 text-on-surface/60">{materia.id}</td>
                    <td className="p-4 font-bold text-on-surface">{materia.nombre}</td>
                    <td className="p-4 text-on-surface/80">{materia.carrera_id === 1 ? "LIDTS" : "LSC"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        Number(materia.activa) === 1 
                          ? 'bg-success-container/30 text-on-success' 
                          : 'bg-outline-variant/20 text-on-surface/60'
                      }`}>
                        {Number(materia.activa) === 1 ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="p-4 text-right flex flex-col gap-1 items-end">
                      <button onClick={() => {
                        setMateriaSeleccionada(materia);
                        setModalOpen(true);
                      }}>
                        Editar
                      </button>
                      <button
                        onClick={() => toggleEstado(materia)}
                        className="text-primary hover:underline font-medium text-sm"
                      >
                        {Number(materia.activa) === 1 ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NuevaMateriaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        materia={materiaSeleccionada}
        onSuccess={handleEdicionExitosa}
      />

    </div>
  );
}