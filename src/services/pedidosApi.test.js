import { vi, it, expect } from 'vitest';
import { clienteApi } from './clienteApi';
import { crearPedidoApi, obtenerMisPedidosApi, obtenerDetallePedidoApi, cancelarDetalleApi, cancelarPedidoApi, mensajeErrorPedido } from './pedidosApi';
import { CLAVES, ESTADOS } from '../constantes';

vi.mock('./clienteApi', () => ({ clienteApi: { post: vi.fn(), get: vi.fn(), patch: vi.fn() } }));

const dto = { id: 7, usuario: 'ana', nombre: 'Ana', telefono: '912345678', direccion: 'Calle', estado: 'PENDIENTE', fecha: '2026-11-24T10:00:00Z', items: [{ id: 31, cilindro: '5KG', nombre: 'Nombre histórico', cantidad: 2, precioUnitario: 6000, cancelado: false }] };

it('crea con el contrato del servidor, sin enviar identidad modificable ni escribir pedidos locales', async () => {
  clienteApi.post.mockResolvedValue({ data: dto });
  const pedido = await crearPedidoApi({ usuario: 'falsificado', nombre: 'Ana', telefono: '912345678', direccion: 'Calle', items: [{ cilindro: '5KG', cantidad: 2, precioUnitario: 6000 }] });
  expect(clienteApi.post).toHaveBeenCalledWith('/pedidos', { nombre: 'Ana', telefono: '912345678', direccion: 'Calle', items: [{ productoId: '5KG', cantidad: 2, precioEsperado: 6000 }] });
  expect(pedido.items[0]).toMatchObject({ id: 31, nombre: 'Nombre histórico', precioUnitario: 6000 });
  expect(localStorage.getItem(CLAVES.PEDIDOS)).toBeNull();
});

it('consulta historial, detalle y cancela mediante IDs reales', async () => {
  clienteApi.get.mockResolvedValueOnce({ data: [dto] }).mockResolvedValueOnce({ data: dto });
  clienteApi.patch.mockResolvedValue({ data: { ...dto, estado: 'CANCELADO' } });
  expect((await obtenerMisPedidosApi())[0].estado).toBe(ESTADOS.PENDIENTE);
  expect((await obtenerDetallePedidoApi(7)).items[0].id).toBe(31);
  expect((await cancelarDetalleApi(7, 31)).estado).toBe(ESTADOS.CANCELADO);
  await cancelarPedidoApi(7);
  expect(clienteApi.get).toHaveBeenCalledWith('/mis-pedidos');
  expect(clienteApi.get).toHaveBeenCalledWith('/pedidos/7');
  expect(clienteApi.patch).toHaveBeenCalledWith('/pedidos/7/detalles/31/cancelacion');
  expect(clienteApi.patch).toHaveBeenCalledWith('/pedidos/7/cancelacion');
});

it('rechaza más de cuatro unidades antes de llamar y aclara los errores del backend', async () => {
  await expect(crearPedidoApi({ items: [{ cilindro: '5KG', cantidad: 5 }] })).rejects.toThrow('cuatro');
  expect(mensajeErrorPedido({ response: { status: 409, data: { code: 'SIN_STOCK', detail: 'Stock insuficiente' } } })).toContain('Stock insuficiente');
  expect(mensajeErrorPedido({ response: { status: 401, data: {} } })).toContain('sesión expiró');
});
