import { clienteApi } from './clienteApi';

export async function obtenerInventarioApi() {
  const { data } = await clienteApi.get('/inventario');
  return data.map(p => ({ id: p.id, nombre: p.nombre, total: p.total, pendiente: p.comprometido, disponible: p.disponible }));
}
