import { clienteApi } from './clienteApi';
import { ROLES } from '../constantes';

export async function obtenerIndicadoresApi() { const { data } = await clienteApi.get('/admin/indicadores'); return data; }
export async function obtenerUsuariosApi() {
  const { data } = await clienteApi.get('/admin/usuarios');
  const roles = { CLIENTE: ROLES.CLIENTE, OPERADOR: ROLES.OPERADOR, ADMINISTRADOR: ROLES.ADMIN };
  return data.map(u => ({ id: u.id, usuario: u.usuario, nombre: u.nombre, rol: roles[u.rol] ?? u.rol }));
}
export async function obtenerProductosAdminApi() {
  const { data } = await clienteApi.get('/admin/productos');
  return data.map(p => ({ ...p, precio: Number(p.precio) }));
}
export async function guardarProductoApi(datos, id = null) {
  const limpio = { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), precio: Number(datos.precio) };
  if (id) { const { data } = await clienteApi.put(`/admin/productos/${id}`, limpio); return data; }
  const { data } = await clienteApi.post('/admin/productos', { ...limpio, id: datos.id, stock: Number(datos.stock) });
  return data;
}
export async function desactivarProductoApi(id) { await clienteApi.delete(`/admin/productos/${id}`); }
export function adaptarIndicadores(d) {
  return {
    'Productos activos': d.productosActivos,
    'Clientes registrados': d.clientesRegistrados,
    'Pedidos pendientes': d.PENDIENTE,
    'Pedidos en camino': d.EN_CAMINO,
    'Pedidos entregados': d.ENTREGADO,
    'Pedidos cancelados': d.CANCELADO,
    'Stock disponible': d.stockDisponible,
    'Monto de pedidos entregados': Number(d.montoPedidosEntregados),
  };
}
