import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FiArrowLeft } from 'react-icons/fi';

export default function Login() {
  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  
  const [credenciales, setCredenciales] = useState({
    correo: '',
    contrasena: '',
    codigoSeguridad: ''
  });

  const manejarCambio = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.id]: e.target.value
    });
    setErrorMensaje(''); // Limpiar el error si el usuario vuelve a escribir
  };

  // Fase 1: Conexión REAL con el backend
  const verificarCredenciales = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorMensaje('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/login', {
        correo: credenciales.correo,
        contrasena: credenciales.contrasena
      });

      // El backend ahora devuelve el token y el usuario
      const { access_token, usuario } = response.data;

      // VALIDACIÓN DE SEGURIDAD EN EL FRONTEND
      const rolEstandarizado = usuario.rol ? usuario.rol.toLowerCase() : '';
      
      if (rolEstandarizado !== 'administrador' && rolEstandarizado !== 'admin') {
        setErrorMensaje('Acceso denegado. Su cuenta no tiene privilegios administrativos.');
        setCargando(false);
        return;
      }

      // ¡NUEVO!: Guardamos tanto los datos del usuario como el Token JWT
      localStorage.setItem('adminUser', JSON.stringify(usuario));
      localStorage.setItem('adminToken', access_token); 
      
      setPaso(2);

    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMensaje(error.response.data.detail || 'Credenciales incorrectas');
      } else {
        setErrorMensaje('Error de conexión con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Fase 2: Simulación del 2FA para el diseño de UI/UX
  const procesarAcceso = (e) => {
    e.preventDefault();
    
    // Como el backend no soporta 2FA, simularemos que cualquier código de 6 dígitos es válido 
    // para cumplir con la maqueta de la clase de UI/UX.
    if (credenciales.codigoSeguridad.length === 6) {
      console.log('Autenticación exitosa. Redirigiendo al dashboard...');
      // Aquí harías la redirección real: window.location.href = '/dashboard' o navigate('/dashboard')
      window.location.href = '/dashboard';
    } else {
      setErrorMensaje('El código de seguridad debe tener 6 dígitos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm bg-surface-lowest p-8 rounded-md shadow-cloud transition-all duration-300">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            The Intentional Archive
          </h1>
          <p className="text-sm text-on-surface/70 mt-1">
            Portal Administrativo UNACH
          </p>
        </div>

        {/* Mostrar alertas de error */}
        {errorMensaje && (
          <div className="mb-4 p-3 rounded bg-error-container/50 text-on-error text-sm text-center font-medium animate-fade-in">
            {errorMensaje}
          </div>
        )}

        {/* Fase 1: Credenciales Base */}
        {paso === 1 && (
          <form onSubmit={verificarCredenciales} className="flex flex-col gap-6 animate-fade-in">
            <Input
              id="correo"
              type="email"
              label="CORREO ELECTRÓNICO INSTITUCIONAL"
              placeholder="admin@unach.mx"
              value={credenciales.correo}
              onChange={manejarCambio}
              required
            />
            
            <Input
              id="contrasena"
              type="password"
              label="CONTRASEÑA"
              placeholder="••••••••"
              value={credenciales.contrasena}
              onChange={manejarCambio}
              required
            />
            
            <Button type="submit" variant="primary" className="mt-2 w-full" disabled={cargando}>
              {cargando ? 'Validando...' : 'Continuar'}
            </Button>
          </form>
        )}

        {/* Fase 2: Verificación de dos pasos (2FA) */}
        {paso === 2 && (
          <form onSubmit={procesarAcceso} className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-2">
              <p className="text-sm font-medium text-on-surface">
                Verificación de seguridad
              </p>
              <p className="text-xs text-on-surface/70 mt-1">
                Ingrese el código de 6 dígitos enviado a su dispositivo autorizado.
              </p>
            </div>

            <Input
              id="codigoSeguridad"
              type="text"
              label="CÓDIGO DE SEGURIDAD"
              placeholder="000000"
              maxLength="6"
              className="text-center tracking-[0.5em] font-mono text-lg"
              value={credenciales.codigoSeguridad}
              onChange={manejarCambio}
              required
            />
            
            <div className="flex gap-3 mt-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => { setPaso(1); setErrorMensaje(''); }}
                className="px-3"
              >
                <FiArrowLeft size={20} />
              </Button>
              
              <Button type="submit" variant="primary" className="flex-1">
                Verificar y Acceder
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}