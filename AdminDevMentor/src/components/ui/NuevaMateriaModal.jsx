import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { FiX } from 'react-icons/fi';

export const NuevaMateriaModal = ({ isOpen, onClose, materia, onSuccess }) => {

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    semestre: '',
    carrera: '',
    estado: 'activo'
  });

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    if (materia) {
      setFormData({
        nombre: materia.nombre,
        descripcion: materia.descripcion,
        semestre: materia.semestre,
        carrera: materia.carrera_id === 1 ? "LIDTS" : "LSC",
        estado: Number(materia.activa) === 1 ? "activo" : "inactivo"
      });
    }
  }, [materia]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const bodyData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        semestre: parseInt(formData.semestre),
        carrera: formData.carrera,
        activa: formData.estado === "activo"
      };

      if (materia) {
        await fetch(`http://localhost:8002/materias/${materia.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formData.nombre,
            carrera_id: formData.carrera === "LIDTS" ? 1 : 2,
            activa: formData.estado === "activo"
          }),
        });
      } else {
        await fetch("http://localhost:8002/materias/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
      }

      setMensaje(materia ? "Materia actualizada" : "Materia registrada");
      setTipoMensaje("success");

      setTimeout(() => {
        setMensaje("");
        onClose();
        if (onSuccess){
          onSuccess();
        }
      }, 1000);

    } catch (error) {
      console.error(error);
      setMensaje("Error al guardar");
      setTipoMensaje("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm">

      <div className="bg-surface-lowest w-full max-w-lg rounded-md shadow-cloud relative">

        <div className="flex justify-between items-start p-6 border-b border-outline-variant/20">
          <h2 className="text-xl font-bold text-on-surface">
            {materia ? "Editar Materia" : "Nueva Materia"}
          </h2>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

          {/* Carrera */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide text-on-surface">
              Carrera
            </label>

            <select
              value={formData.carrera}
              onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
              required
              className="
                w-full
                h-10
                px-3
                rounded-md
                border border-outline-variant/40
                bg-surface-lowest
                text-sm
                font-medium
                text-on-surface
                focus:outline-none
                focus:ring-2
                focus:ring-primary/40
                focus:border-primary
                transition
                duration-200
              "
            >
              <option value="">Selecciona carrera</option>
              <option value="LIDTS">LIDTS</option>
              <option value="LSC">LSC</option>
            </select>
          </div>

          {/* Nombre */}
          <Input
            label="Materia"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          {/* Descripción */}
          <Input
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />

          {/* Semestre */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wide text-on-surface">
              Semestre
            </label>

            <select
              value={formData.semestre}
              onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
              required
              className="
                w-full
                h-10
                px-3
                rounded-md
                border border-outline-variant/40
                bg-surface-lowest
                text-sm
                font-medium
                text-on-surface
                focus:outline-none
                focus:ring-2
                focus:ring-primary/40
                focus:border-primary
                transition
                duration-200
              "
            >
              <option value="">Seleccione el semestre</option>
              {[1,2,3,4,5,6,7,8,9].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label>
              <input
                type="radio"
                value="activo"
                checked={formData.estado === "activo"}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              />
              Activo
            </label>

            <label>
              <input
                type="radio"
                value="inactivo"
                checked={formData.estado === "inactivo"}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              />
              Inactivo
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {materia ? "Actualizar" : "Registrar"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};