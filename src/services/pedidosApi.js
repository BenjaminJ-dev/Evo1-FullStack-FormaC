import { clienteApi } from './clienteApi';
import { ESTADOS, MAX_CANTIDAD } from '../constantes';

const estados = { PENDIENTE: ESTADOS.PENDIENTE, EN_CAMINO: ESTADOS.EN_CAMINO, ENTREGADO: ESTADOS.ENTREGADO, CANCELADO: ESTADOS.CANCELADO };

export function adaptarPedido(d) {
  return {
    id: d.id, usuario: d.usuario, nombre: d.nombre, telefono: d.telefono,
    direccion: d.direccion, estado: estados[d.estado],
    fecha: new Date(d.fecha).toLocaleString('es-CL'),
    items: d.items.map(i => ({ id: i.id, cilindro: i.cilindro, nombre: i.nombre, cantidad: i.cantidad, precioUnitario: Number(i.precioUnitario), cancelado: i.cancelado })),
  };
}

export async function crearPedidoApi({ nombre, telefono, direccion, items }) {
  if (!items.length || items.reduce((n, i) => n + i.cantidad, 0) > MAX_CANTIDAD || items.some(i => !Number.isInteger(i.cantidad) || i.cantidad < 1)) throw new Error('Selecciona entre uno y cuatro cilindros.');
  const { data } = await clienteApi.post('/pedidos', {
    nombre, telefono, direccion,
    items: items.map(i => ({ productoId: i.cilindro, cantidad: i.cantidad, precioEsperado: i.precioUnitario })),
  });
  return adaptarPedido(data);
}
export async function obtenerMisPedidosApi() { const { data } = await clienteApi.get('/mis-pedidos'); return data.map(adaptarPedido); }
export async function obtenerPedidosGestionApi() { const { data } = await clienteApi.get('/pedidos'); return data.map(adaptarPedido); }
export async function avanzarPedidoApi(id, estado) {
  const tecnicos = { [ESTADOS.EN_CAMINO]: 'EN_CAMINO', [ESTADOS.ENTREGADO]: 'ENTREGADO' };
  if (!tecnicos[estado]) throw new Error('Transición de pedido no válida.');
  const { data } = await clienteApi.patch(`/pedidos/${id}/estado`, { estado: tecnicos[estado] });
  return adaptarPedido(data);
}
export async function obtenerDetallePedidoApi(id) { const { data } = await clienteApi.get(`/pedidos/${id}`); return adaptarPedido(data); }
export async function cancelarPedidoApi(id) { const { data } = await clienteApi.patch(`/pedidos/${id}/cancelacion`); return adaptarPedido(data); }
export async function cancelarDetalleApi(id, detalleId) { const { data } = await clienteApi.patch(`/pedidos/${id}/detalles/${detalleId}/cancelacion`); return adaptarPedido(data); }

export function mensajeErrorPedido(error) {
  if (!error.response) return error.message && !error.isAxiosError ? error.message : 'No se pudo conectar con el servidor. El carrito sigue intacto.';
  if (error.response.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente; el carrito sigue intacto.';
  if (error.response.status === 403) return 'No tienes permiso para realizar esta acción.';
  const codigo = error.response.data?.code;
  if (codigo === 'SIN_STOCK') return error.response.data.detail || 'No hay stock suficiente. Ajusta tu carrito.';
  if (codigo === 'PRECIO_CAMBIADO') return 'El precio cambió. Revisa el carrito y confirma nuevamente.';
  return error.response.data?.detail || 'No se pudo completar la operación. Inténtalo nuevamente.';
}
