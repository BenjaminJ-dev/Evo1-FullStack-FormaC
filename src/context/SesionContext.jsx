// src/context/SesionContext.jsx
// Estado global: quién tiene la sesión iniciada y con qué rol.
// Reemplaza a la antigua función exigirSesion() de datos.js.
import { createContext, useContext, useEffect, useState } from 'react';
import { obtenerSesion, cerrarSesion, borrarSesion } from '../services/usuariosServicio';
import { clienteApi } from '../services/clienteApi';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  // Al abrir la app se recupera la sesión guardada en la pestaña (si existe)
  const [sesion, setSesion] = useState(null);
  const [validando, setValidando] = useState(() => !!obtenerSesion());
  useEffect(() => {
    const guardada = obtenerSesion();
    if (!guardada) { setValidando(false); return; }
    let vigente = true;
    clienteApi.get('/auth/me').then(() => {
      if (vigente) setSesion(obtenerSesion());
    }).catch(() => {
      if (vigente) { borrarSesion(); setSesion(null); }
    }).finally(() => { if (vigente) setValidando(false); });
    return () => { vigente = false; };
  }, []);
  useEffect(() => { const sincronizar = () => setSesion(obtenerSesion()); window.addEventListener('sesion-actualizada', sincronizar); window.addEventListener('sesion-expirada', sincronizar); return () => { window.removeEventListener('sesion-actualizada', sincronizar); window.removeEventListener('sesion-expirada', sincronizar); }; }, []);

  const iniciarSesion = (datosSesion) => {
    setSesion(datosSesion);
    setValidando(false);
  };

  const salir = async () => { try { await cerrarSesion(); } finally { setSesion(null); } };

  return (
    <SesionContext.Provider value={{ sesion, validando, iniciarSesion, cerrarSesion: salir }}>
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
