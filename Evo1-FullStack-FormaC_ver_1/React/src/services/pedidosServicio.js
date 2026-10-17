// src/services/pedidosServicio.js
// Pedidos e inventario. TODAS las reglas de negocio de pedidos viven aquí,
// cada una en un solo lugar; los componentes solo las llaman.
//
// Forma de un pedido:
//   { id, usuario, nombre, telefono, direccion, estado, fecha,
//     items: [{ cilindro, cantidad, precioUnitario, cancelado }] }
//
// TODO backend: cada función de este archivo pasará a ser una petición a la
// API (GET/POST/PATCH /pedidos, /inventario). La firma de las funciones
// puede mantenerse igual para que los componentes no cambien.
import { CLAVES, ESTADOS, PRODUCTOS_BASE, obtenerProducto } from '../constantes';
import { leerLocal, guardarLocal } from './almacenamiento';

// ---------------------------------------------------------------
// Lectura y guardado
// ---------------------------------------------------------------
export function obtenerPedidos() {
  return leerLocal(CLAVES.PEDIDOS, []);
}

// Pedidos de un cliente, del más reciente al más antiguo
export function obtenerPedidosDeUsuario(usuario) {
  return obtenerPedidos()
    .filter((pedido) => pedido.usuario === usuario)
    .reverse();
}

function guardarPedidos(pedidos) {
  guardarLocal(CLAVES.PEDIDOS, pedidos);
}

function buscarPedido(pedidos, idPedido) {
  return pedidos.find((pedido) => pedido.id === idPedido);
}

// ---------------------------------------------------------------
// Reglas de los pedidos
// ---------------------------------------------------------------

// REGLA ÚNICA: un pedido (o uno de sus ítems) solo se puede cancelar
// mientras esté "Pendiente". Una vez "En camino" ya salió el camión.
// Cliente y operador usan esta misma función.
export function sePuedeCancelar(pedido) {
  return pedido.estado === ESTADOS.PENDIENTE;
}

// Orden del seguimiento: Pendiente -> En camino -> Entregado
export function siguienteEstado(estado) {
  if (estado === ESTADOS.PENDIENTE) return ESTADOS.EN_CAMINO;
  if (estado === ESTADOS.EN_CAMINO) return ESTADOS.ENTREGADO;
  return null; // Entregado y Cancelado no avanzan
}

function itemsActivos(pedido) {
  return pedido.items.filter((item) => !item.cancelado);
}

// Total en pesos del pedido (los ítems cancelados no cuentan)
export function calcularTotalPedido(pedido) {
  return itemsActivos(pedido).reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);
}

// ---------------------------------------------------------------
// Inventario en 3 columnas
//   Total = Pendiente a enviar + Disponible a enviar
//
// - Total: stock físico en bodega. Se guarda, y solo baja al ENTREGAR.
// - Pendiente a enviar: se CALCULA sumando los ítems no cancelados de los
//   pedidos "Pendiente" o "En camino". No se guarda aparte: así nunca se
//   desincroniza.
// - Disponible: Total - Pendiente.
// ---------------------------------------------------------------
function obtenerTotales() {
  const guardados = leerLocal(CLAVES.INVENTARIO, null);
  if (guardados) return guardados;
  const iniciales = {};
  PRODUCTOS_BASE.forEach((producto) => {
    iniciales[producto.id] = producto.total;
  });
  guardarLocal(CLAVES.INVENTARIO, iniciales);
  return iniciales;
}

export function calcularPendiente(idProducto, pedidos = obtenerPedidos()) {
  return pedidos
    .filter((pedido) => pedido.estado === ESTADOS.PENDIENTE || pedido.estado === ESTADOS.EN_CAMINO)
    .flatMap(itemsActivos)
    .filter((item) => item.cilindro === idProducto)
    .reduce((suma, item) => suma + item.cantidad, 0);
}

export function calcularDisponible(idProducto, pedidos = obtenerPedidos()) {
  const total = obtenerTotales()[idProducto] ?? 0;
  return total - calcularPendiente(idProducto, pedidos);
}

export function obtenerResumenInventario() {
  const totales = obtenerTotales();
  const pedidos = obtenerPedidos();
  return PRODUCTOS_BASE.map((producto) => {
    const total = totales[producto.id] ?? 0;
    const pendiente = calcularPendiente(producto.id, pedidos);
    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      total,
      pendiente,
      disponible: total - pendiente,
    };
  });
}

// Devuelve los nombres de los productos que NO tienen stock suficiente
// para cubrir los ítems pedidos (lista vacía = hay stock para todo).
export function validarStockPedido(items) {
  const pedidos = obtenerPedidos();
  return items
    .filter((item) => item.cantidad > calcularDisponible(item.cilindro, pedidos))
    .map((item) => obtenerProducto(item.cilindro)?.nombre ?? item.cilindro);
}

// Descuenta del Total físico lo que salió de bodega (solo se llama al entregar)
function descontarStock(items) {
  const totales = obtenerTotales();
  items.forEach((item) => {
    totales[item.cilindro] = Math.max(0, (totales[item.cilindro] ?? 0) - item.cantidad);
  });
  guardarLocal(CLAVES.INVENTARIO, totales);
}

// ---------------------------------------------------------------
// Acciones sobre los pedidos
// ---------------------------------------------------------------

// Crea el pedido si hay stock para TODOS los ítems; si falta stock de
// alguno, se rechaza el pedido completo.
// Devuelve { ok: true, pedido } o { ok: false, sinStock: [nombres] }
export function crearPedido({ usuario, nombre, telefono, direccion, items }) {
  const sinStock = validarStockPedido(items);
  if (sinStock.length > 0) {
    return { ok: false, sinStock };
  }
  const pedido = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    usuario,
    nombre,
    telefono,
    direccion,
    estado: ESTADOS.PENDIENTE,
    fecha: new Date().toLocaleString('es-CL'),
    // Se guarda el precio del momento: si el precio cambia después,
    // el historial de pedidos no se altera.
    items: items.map((item) => ({
      cilindro: item.cilindro,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      cancelado: false,
    })),
  };
  const pedidos = obtenerPedidos();
  pedidos.push(pedido);
  guardarPedidos(pedidos);
  return { ok: true, pedido };
}

// Cancela UN ítem del pedido. Si era el último ítem activo,
// el pedido completo pasa solo a "Cancelado".
export function cancelarItem(idPedido, indiceItem) {
  const pedidos = obtenerPedidos();
  const pedido = buscarPedido(pedidos, idPedido);
  const item = pedido?.items[indiceItem];
  if (!pedido || !item || item.cancelado || !sePuedeCancelar(pedido)) {
    return { ok: false };
  }
  item.cancelado = true;
  if (itemsActivos(pedido).length === 0) {
    pedido.estado = ESTADOS.CANCELADO;
  }
  guardarPedidos(pedidos);
  return { ok: true, pedido };
}

// Cancela el pedido completo (todos sus ítems)
export function cancelarPedido(idPedido) {
  const pedidos = obtenerPedidos();
  const pedido = buscarPedido(pedidos, idPedido);
  if (!pedido || !sePuedeCancelar(pedido)) {
    return { ok: false };
  }
  pedido.items.forEach((item) => {
    item.cancelado = true;
  });
  pedido.estado = ESTADOS.CANCELADO;
  guardarPedidos(pedidos);
  return { ok: true, pedido };
}

// Avanza el estado de seguimiento. Al llegar a "Entregado" recién ahí
// baja el Total físico del inventario.
export function avanzarEstado(idPedido) {
  const pedidos = obtenerPedidos();
  const pedido = buscarPedido(pedidos, idPedido);
  const nuevoEstado = pedido ? siguienteEstado(pedido.estado) : null;
  if (!nuevoEstado) {
    return { ok: false };
  }
  pedido.estado = nuevoEstado;
  if (nuevoEstado === ESTADOS.ENTREGADO) {
    descontarStock(itemsActivos(pedido));
  }
  guardarPedidos(pedidos);
  return { ok: true, pedido };
}
