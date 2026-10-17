// src/context/SesionContext.jsx
// Estado global: quién tiene la sesión iniciada y con qué rol.
// Reemplaza a la antigua función exigirSesion() de datos.js.
import { createContext, useContext, useState } from 'react';
import { obtenerSesion, guardarSesion, cerrarSesion } from '../services/usuariosServicio';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  // Al abrir la app se recupera la sesión guardada en la pestaña (si existe)
  const [sesion, setSesion] = useState(() => obtenerSesion());

  const iniciarSesion = (datosSesion) => {
    guardarSesion(datosSesion);
    setSesion(datosSesion);
  };

  const salir = () => {
    cerrarSesion();
    setSesion(null);
  };

  return (
    <SesionContext.Provider value={{ sesion, iniciarSesion, cerrarSesion: salir }}>
      {children}
    </SesionContext.Provider>
  );
}

// Hook para leer la sesión desde cualquier componente
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) {
    throw new Error('useSesion debe usarse dentro de un SesionProvider');
  }
  return contexto;
}
