import { vi, it, expect } from 'vitest';
import { clienteApi } from './clienteApi';
import { obtenerInventarioApi } from './inventarioApi';
import { obtenerIndicadoresApi, obtenerUsuariosApi, guardarProductoApi, desactivarProductoApi, adaptarIndicadores } from './adminApi';
import { obtenerPedidosGestionApi, avanzarPedidoApi } from './pedidosApi';

vi.mock('./clienteApi', () => ({ clienteApi: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

it('adapta el inventario real sin inventar un precio', async () => {
  clienteApi.get.mockResolvedValue({ data: [{ id: '5KG', nombre: 'Gas', total: 25, comprometido: 2, disponible: 23 }] });
  expect(await obtenerInventarioApi()).toEqual([{ id: '5KG', nombre: 'Gas', total: 25, pendiente: 2, disponible: 23 }]);
  expect(clienteApi.get).toHaveBeenCalledWith('/inventario');
});

it('envía solo transiciones permitidas al endpoint del operador', async () => {
  clienteApi.patch.mockResolvedValue({ data: { id: 1, usuario: 'ana', nombre: 'Ana', telefono: '912345678', direccion: 'Calle', estado: 'EN_CAMINO', fecha: '2026-11-24T10:00:00Z', items: [] } });
  expect((await avanzarPedidoApi(1, 'En camino')).estado).toBe('En camino');
  expect(clienteApi.patch).toHaveBeenCalledWith('/pedidos/1/estado', { estado: 'EN_CAMINO' });
  await expect(avanzarPedidoApi(1, 'Cancelado')).rejects.toThrow();
});

it('crea y edita sin cambiar el ID; desactiva sin borrar', async () => {
  clienteApi.post.mockResolvedValue({ data: {} }); clienteApi.put.mockResolvedValue({ data: {} }); clienteApi.delete.mockResolvedValue({ status: 204 });
  await guardarProductoApi({ id: 'NUEVO', nombre: ' Nuevo ', descripcion: ' Gas ', precio: '100', stock: '2' });
  await guardarProductoApi({ id: 'CAMBIADO', nombre: 'Editado', descripcion: 'Gas', precio: '200' }, 'NUEVO');
  await desactivarProductoApi('NUEVO');
  expect(clienteApi.post).toHaveBeenCalledWith('/admin/productos', { id: 'NUEVO', nombre: 'Nuevo', descripcion: 'Gas', precio: 100, stock: 2 });
  expect(clienteApi.put).toHaveBeenCalledWith('/admin/productos/NUEVO', { nombre: 'Editado', descripcion: 'Gas', precio: 200 });
  expect(clienteApi.delete).toHaveBeenCalledWith('/admin/productos/NUEVO');
});

it('consulta indicadores y usuarios sin contraseñas', async () => {
  clienteApi.get.mockImplementation(async url => ({ data: url === '/admin/usuarios' ? [{ id: 1, usuario: 'ana', nombre: 'Ana', rol: 'CLIENTE' }] : { productosActivos: 4, clientesRegistrados: 1, PENDIENTE: 2, EN_CAMINO: 0, ENTREGADO: 0, CANCELADO: 0, stockDisponible: 10, montoPedidosEntregados: 0 } }));
  expect(adaptarIndicadores(await obtenerIndicadoresApi())['Pedidos pendientes']).toBe(2);
  expect(await obtenerUsuariosApi()).toEqual([{ id: 1, usuario: 'ana', nombre: 'Ana', rol: 'cliente' }]);
});
