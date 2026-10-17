// src/context/MensajeContext.jsx
// Estado global del banner de avisos (error o éxito) que se muestra arriba
// de toda la página. Reemplaza a la antigua función mostrarMensaje().
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const MensajeContext = createContext(null);

const SEGUNDOS_VISIBLE = 5;

export function MensajeProvider({ children }) {
  const [mensaje, setMensaje] = useState(null); // { texto, tipo: 'error' | 'exito' }
  const temporizador = useRef(null);

  const cerrarMensaje = useCallback(() => {
    clearTimeout(temporizador.current);
    setMensaje(null);
  }, []);

  const mostrarMensaje = useCallback((texto, tipo = 'error') => {
    clearTimeout(temporizador.current);
    setMensaje({ texto, tipo });
    // Se cierra solo después de unos segundos (o antes, con la "X")
    temporizador.current = setTimeout(() => setMensaje(null), SEGUNDOS_VISIBLE * 1000);
  }, []);

  // Al desmontar se limpia el temporizador pendiente
  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <MensajeContext.Provider value={{ mensaje, mostrarMensaje, cerrarMensaje }}>
      {children}
    </MensajeContext.Provider>
  );
}

// Hook para mostrar avisos desde cualquier componente
export function useMensaje() {
  const contexto = useContext(MensajeContext);
  if (!contexto) {
    throw new Error('useMensaje debe usarse dentro de un MensajeProvider');
  }
  return contexto;
}
