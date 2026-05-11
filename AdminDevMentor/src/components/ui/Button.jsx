import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-2.5 rounded-md font-medium transition-all duration-200 flex items-center justify-center";
  
  const variants = {
    // Gradiente "lit-from-within", sin bordes
    primary: "bg-gradient-to-r from-primary to-primary-container text-white hover:opacity-90 shadow-sm",
    
    // Alternativa suave ("soft alternative")
    secondary: "bg-surface-high text-on-surface hover:bg-surface-low",
    
    // Sin fondo, texto primario (acciones de baja prioridad)
    tertiary: "bg-transparent text-primary hover:bg-surface-low",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};