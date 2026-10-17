// src/hooks/useInventario.js
// Carga el inventario en 3 columnas (Total / Pendiente / Disponible).
// "recargar" vuelve a calcularlo tras una acción (entregar, cancelar...).
import { useCallback, useState } from 'react';
import { obtenerResumenInventario } from '../services/pedidosServicio';

export default function useInventario() {
  const [resumen, setResumen] = useState(obtenerResumenInventario);

  const recargar = useCallback(() => setResumen(obtenerResumenInventario()), []);

  return { resumen, recargar };
}
