import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Paginacion = ({ 
  paginaActual, 
  totalItems, 
  itemsPorPagina, 
  onCambiarPagina, 
  onCambiarItemsPorPagina 
}) => {
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina) || 1;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-outline-variant/20 bg-surface-high/10 gap-4">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-2 text-sm text-on-surface/70">
        <span>Mostrar</span>
        <select 
          value={itemsPorPagina} 
          onChange={(e) => onCambiarItemsPorPagina(Number(e.target.value))}
          className="bg-surface-lowest border border-outline-variant/30 rounded px-2 py-1 outline-none focus:border-primary shadow-sm"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>reportes por página</span>
      </div>

      {/* Información y Controles */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-on-surface/60">
          Página <span className="font-bold text-on-surface">{paginaActual}</span> de {totalPaginas} 
          <span className="mx-2">|</span> 
          Total: {totalItems}
        </span>
        
        <div className="flex gap-1">
          <button 
            onClick={() => onCambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-1.5 rounded-md border border-outline-variant/30 bg-surface-lowest text-on-surface hover:bg-surface-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>
          <button 
            onClick={() => onCambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-1.5 rounded-md border border-outline-variant/30 bg-surface-lowest text-on-surface hover:bg-surface-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};