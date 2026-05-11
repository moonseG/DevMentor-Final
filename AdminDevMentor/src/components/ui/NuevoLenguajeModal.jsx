import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { FiX } from "react-icons/fi";

export const NuevoLenguajeModal = ({ isOpen, onClose, lenguaje, onSuccess }) => {

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true
  });

  useEffect(() => {
    if (lenguaje) {
      setFormData({
        nombre: lenguaje.nombre,
        descripcion: lenguaje.descripcion,
        activo: lenguaje.activo === 1
      });
    }
  }, [lenguaje]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8002/lenguajes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al crear lenguaje");
      }

      const data = await response.json();
      console.log("Lenguaje creado:", data);

      if (onSuccess) onSuccess(); // refrescar dashboard
      onClose(); // cerrar modal

      setFormData({
        nombre: "",
        descripcion: "",
        activo: true
      });

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-surface-lowest w-full max-w-lg rounded-md shadow-cloud">

        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {lenguaje ? "Editar Lenguaje" : "Nuevo Lenguaje"}
          </h2>
          <button onClick={onClose}>
            <FiX size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <Input
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            required
          />

          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={formData.activo === true}
                onChange={() => setFormData({ ...formData, activo: true })}
              />
              Activo
            </label>

            <label>
              <input
                type="radio"
                checked={formData.activo === false}
                onChange={() => setFormData({ ...formData, activo: false })}
              />
              Inactivo
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {lenguaje ? "Actualizar" : "Registrar"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};