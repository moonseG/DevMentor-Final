import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiUsers, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';

export const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const menuItems = [
    { name: 'INICIO', path: '/dashboard', icon: <FiHome size={20} /> },
    { name: 'REPORTES', path: '/reportes', icon: <FiFileText size={20} /> },
    { name: 'USUARIOS', path: '/usuarios', icon: <FiUsers size={20} /> },
    { name: 'RESEÑAS', path: '/resenas', icon: <FiMessageSquare size={20} /> },
    { name: 'CONFIGURACIÓN', path: '/configuracion', icon: <FiSettings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-surface-low border-r border-outline-variant/20 h-screen flex flex-col sticky top-0">
      {/* Logo / Branding */}
      <div className="h-20 flex items-center px-6 border-b border-outline-variant/20">
        <div className="bg-primary text-white p-2 rounded-md mr-3">
          <FiHome size={24} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary leading-tight">Admin Panel</h2>
          <p className="text-[10px] text-on-surface/60 tracking-widest uppercase">Advisory Archive</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary before:rounded-r-md'
                  : 'text-on-surface/70 hover:bg-surface-high hover:text-on-surface'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Botón de Salir */}
      <div className="p-4 border-t border-outline-variant/20">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-sm font-medium text-on-error hover:bg-error-container/50 transition-colors"
        >
          <FiLogOut size={20} />
          CERRAR SESIÓN
        </button>
      </div>
    </aside>
  );
};