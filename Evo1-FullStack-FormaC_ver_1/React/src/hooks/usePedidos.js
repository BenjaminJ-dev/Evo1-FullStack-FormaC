// src/hooks/usePedidos.js
// Carga los pedidos para una pantalla: los de un cliente (si se indica su
// usuario) o todos (operador). "recargar" vuelve a leerlos tras una acción.
import { useCallback, useState } from 'react';
import { obtenerPedidos, obtenerPedidosDeUsuario } from '../services/pedidosServicio';

export default function usePedidos(usuario = null) {
  const cargar = useCallback(
    () => (usuario ? obtenerPedidosDeUsuario(usuario) : [...obtenerPedidos()].reverse()),
    [usuario],
  );
  const [pedidos, setPedidos] = useState(cargar);

  const recargar = useCallback(() => setPedidos(cargar()), [cargar]);

  return { pedidos, recargar };
}
