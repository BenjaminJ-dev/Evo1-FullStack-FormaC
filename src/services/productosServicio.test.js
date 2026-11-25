import { obtenerProductos, obtenerProducto, guardarProducto, desactivarProducto } from './productosServicio';
import { guardarSesion, obtenerUsuariosAdministracion } from './usuariosServicio';
import { crearPedido, obtenerPedidos, obtenerResumenInventario } from './pedidosServicio';
const admin = () => guardarSesion({ accessToken: 'access', refreshToken: 'refresh', rol: 'ADMINISTRADOR', username: 'admin' });
const nuevo = { id: 'NUEVO', nombre: 'Cilindro nuevo', descripcion: 'Cilindro', precio: 2000, stock: 2 };
const compra = (id = '5KG', cantidad = 1) => crearPedido({ usuario: 'cliente', items: [{ cilindro: id, cantidad, precioUnitario: 1 }] });
it('migra los cuatro productos sin duplicarlos', () => {
  expect(obtenerProductos().map(p => p.id)).toEqual(['5KG','11KG','15KG','45KG']);
  expect(obtenerProductos()).toHaveLength(4);
});
it.each([null, 'cliente', 'operador'])('rechaza escrituras del rol %s', rol => {
  if (rol) guardarSesion({ accessToken: 'access', refreshToken: 'refresh', rol: rol.toUpperCase(), username: rol });
  expect(guardarProducto(nuevo).ok).toBe(false);
  expect(desactivarProducto('5KG').ok).toBe(false);
  expect(obtenerUsuariosAdministracion()).toEqual([]);
});
it('crea, edita sin cambiar ID y desactiva sin borrar', () => {
  admin();
  expect(guardarProducto(nuevo).ok).toBe(true);
  expect(guardarProducto(nuevo).ok).toBe(false);
  expect(guardarProducto({ ...nuevo, id: 'OTRO', precio: 3000 }, 'NUEVO').ok).toBe(true);
  expect(obtenerProducto('OTRO')).toBeUndefined();
  expect(obtenerProducto('NUEVO').precio).toBe(3000);
  expect(desactivarProducto('NUEVO').ok).toBe(true);
  expect(obtenerProducto('NUEVO').activo).toBe(false);
  expect(compra('NUEVO').ok).toBe(false);
});
it('valida precio y stock inicial', () => {
  admin();
  for (const cambios of [{ precio: -1 }, { stock: -1 }, { stock: 1.5 }, { nombre: '' }]) expect(guardarProducto({ ...nuevo, ...cambios }).ok).toBe(false);
});
it('conserva nombre y precio historicos usando el catalogo vigente', () => {
  admin();
  const original = obtenerProducto('5KG');
  expect(compra().ok).toBe(true);
  guardarProducto({ ...original, nombre: 'Nombre cambiado', precio: 9000 }, '5KG');
  desactivarProducto('5KG');
  expect(obtenerPedidos()[0].items[0]).toMatchObject({ nombre: original.nombre, precioUnitario: original.precio });
  expect(compra().ok).toBe(false);
});
it('mantiene stock unico, reserva y rechaza sobreventa y mas de cuatro', () => {
  admin(); guardarProducto(nuevo);
  expect(compra('NUEVO', 2).ok).toBe(true);
  expect(compra('NUEVO').ok).toBe(false);
  expect(compra('5KG', 5).ok).toBe(false);
  expect(obtenerResumenInventario().find(p => p.id === 'NUEVO')).toMatchObject({ total: 2, pendiente: 2, disponible: 0 });
});
it('proyecta usuarios sin claves sensibles', () => {
  admin();
  for (const usuario of obtenerUsuariosAdministracion()) expect(Object.keys(usuario).sort()).toEqual(['nombre','rol','usuario']);
});
