// src/constantes.js
// Valores fijos del sistema. Se centralizan aquí para no repetir textos
// ni números sueltos por el código (si algo cambia, se cambia en un solo lugar).

export const ROLES = {
  CLIENTE: 'cliente',
  OPERADOR: 'operador',
  ADMIN: 'admin',
};

export const ESTADOS = {
  PENDIENTE: 'Pendiente',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

// Máximo de cilindros que se pueden llevar en UN pedido (total del carrito).
// Se eligió 4 por ser lo que pediría una persona normal.
export const MAX_CANTIDAD = 4;

// Las claves llevan versión ("v2") porque la forma del pedido cambió
// (ahora tiene "items"). Así los datos de la versión anterior no rompen nada.
export const CLAVES = {
  CLIENTES: 'gasVolcan_v2_clientes',
  PEDIDOS: 'gasVolcan_v2_pedidos',
  INVENTARIO: 'gasVolcan_v2_inventario',
  SESION: 'gasVolcan_v2_sesion',
};

// ÚNICA fuente de los productos: de aquí leen la página de productos,
// el selector del pedido y el inventario. "total" es el stock físico inicial.
export const PRODUCTOS_BASE = [
  { id: '5KG', nombre: 'Cilindro GLP 5KG', descripcion: 'Ideal para uso residencial', precio: 6000, total: 25 },
  { id: '11KG', nombre: 'Cilindro GLP 11KG', descripcion: 'Cilindro estándar para el hogar', precio: 11000, total: 30 },
  { id: '15KG', nombre: 'Cilindro GLP 15KG', descripcion: 'Para hogares de mayor consumo', precio: 14500, total: 20 },
  { id: '45KG', nombre: 'Cilindro GLP 45KG', descripcion: 'Uso comercial', precio: 40000, total: 8 },

  // Accesorios comentados temporalmente: el sistema de pedidos e inventario
  // por ahora solo maneja cilindros de gas. Se decidió no venderlos hasta
  // definir cómo se integrarían al inventario y al formulario de pedido.
  // Descomentar y conectar cuando se tome esa decisión.
  // { id: 'REGULADOR', nombre: 'Regulador doméstico estándar', descripcion: 'Accesorio', precio: 8200, total: 0 },
  // { id: 'MANGUERA', nombre: 'Manguera de gas 1.5M', descripcion: 'Accesorio', precio: 3500, total: 0 },
  // { id: 'DETECTOR', nombre: 'Detector de gas', descripcion: 'Accesorio', precio: 17000, total: 0 },
];

export function obtenerProducto(id) {
  return PRODUCTOS_BASE.find((producto) => producto.id === id);
}

// Muestra un monto en pesos chilenos: 6000 -> "$6.000"
export function formatearPesos(monto) {
  return `$${monto.toLocaleString('es-CL')}`;
}
