import { vi, expect, it } from 'vitest';
import { obtenerCatalogoPublico, obtenerProductoCompra } from './productosServicio';
import { clienteApi } from './clienteApi';

vi.mock('./clienteApi', () => ({ clienteApi: { get: vi.fn() } }));

it('adapta la respuesta y omite productos inactivos', async () => {
  clienteApi.get.mockResolvedValue({ data: [
    { id: '5KG', nombre: 'Cilindro', descripcion: 'Gas', precio: '6000.00', activo: true },
    { id: 'X', nombre: 'Oculto', descripcion: 'Gas', precio: 100, activo: false },
  ] });
  expect(await obtenerCatalogoPublico()).toEqual([
    { id: '5KG', nombre: 'Cilindro', descripcion: 'Gas', precio: 6000, activo: true },
  ]);
  expect(clienteApi.get).toHaveBeenCalledWith('/productos');
  expect(obtenerProductoCompra('5KG').precio).toBe(6000);
  expect(obtenerProductoCompra('X')).toBeUndefined();
});
