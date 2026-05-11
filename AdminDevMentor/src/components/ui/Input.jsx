import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  id, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-semibold text-on-surface uppercase tracking-wider mb-2"
        >
          {label}
        </label>
      )}
      
      {/* Fondo surface-high, solo borde inferior. 
        Al hacer focus: fondo cambia a blanco (lowest) y borde a primary. 
      */}
      <input
        id={id}
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-t-md outline-none transition-all duration-300
          bg-surface-high border-b-2 
          ${error 
            ? 'border-error-container text-on-error focus:border-error-container focus:bg-error-container/20' 
            : 'border-outline-variant text-on-surface focus:border-primary focus:bg-surface-lowest shadow-sm'
          }
        `}
        {...props}
      />
      
      {error && (
        <span className="text-xs text-on-error mt-1">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';