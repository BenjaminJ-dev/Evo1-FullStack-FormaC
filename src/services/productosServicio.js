import { PRODUCTOS_BASE, CLAVES, ROLES } from '../constantes';
import { leerLocal, guardarLocal } from './almacenamiento';
import { obtenerSesion } from './usuariosServicio';
import { clienteApi } from './clienteApi';

// Lectura publica de H2; los otros flujos conservan su estado local.
let catalogoPublico = [];
let catalogoCargado = false;
export async function obtenerCatalogoPublico() {
  const { data } = await clienteApi.get('/productos');
  if (!Array.isArray(data)) throw new Error('La respuesta del catálogo no es válida.');
  catalogoPublico = data.filter(p => p.activo === true).map(p => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: Number(p.precio),
    activo: p.activo,
  }));
  catalogoCargado = true;
  return catalogoPublico;
}
export const obtenerProductoCompra = id => catalogoCargado ? catalogoPublico.find(p => p.id === id) : obtenerProducto(id);

export const CLAVE_PRODUCTOS = 'gasVolcan_v3_productos';
export function obtenerProductos() {
  const existentes = leerLocal(CLAVE_PRODUCTOS, null);
  if (existentes) return existentes;
  const iniciales = PRODUCTOS_BASE.map(({ total, ...producto }) => ({ ...producto, activo: true }));
  guardarLocal(CLAVE_PRODUCTOS, iniciales);
  return iniciales;
}
export const obtenerProducto = (id) => obtenerProductos().find(p => p.id === id);
export const obtenerProductosActivos = () => obtenerProductos().filter(p => p.activo);
// Control local para esta etapa. La API deberá autorizar cada operación en el servidor.
export function guardarProducto(datos, id = null) {
  if (obtenerSesion()?.rol !== ROLES.ADMIN) return { ok: false, error: 'Acceso exclusivo de administración.' };
  const productos = obtenerProductos();
  const actual = id ? productos.find(p => p.id === id) : null;
  if (id && !actual) return { ok: false, error: 'Producto inexistente.' };
  if (!datos.nombre?.trim() || !datos.descripcion?.trim() || !Number.isFinite(datos.precio) || datos.precio <= 0 || !Number.isInteger(datos.precio)) return { ok: false, error: 'Ingresa nombre, descripción y precio entero mayor que cero.' };
  if (!id && (!/^[A-Z0-9_-]+$/.test(datos.id ?? '') || productos.some(p => p.id === datos.id) || !Number.isInteger(datos.stock) || datos.stock < 0)) return { ok: false, error: 'Identificador único requerido y stock entero no negativo.' };
  const producto = { id: id ?? datos.id, nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), precio: datos.precio, activo: actual?.activo ?? true };
  if (actual) productos[productos.indexOf(actual)] = producto;
  else {
    const totales = leerLocal(CLAVES.INVENTARIO, null) ?? Object.fromEntries(PRODUCTOS_BASE.map(p => [p.id, p.total]));
    totales[producto.id] = datos.stock;
    guardarLocal(CLAVES.INVENTARIO, totales);
    productos.push(producto);
  }
  guardarLocal(CLAVE_PRODUCTOS, productos);
  return { ok: true, producto };
}
export function desactivarProducto(id) {
  if (obtenerSesion()?.rol !== ROLES.ADMIN) return { ok: false, error: 'Acceso exclusivo de administración.' };
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === id);
  if (!producto) return { ok: false, error: 'Producto inexistente.' };
  producto.activo = false;
  guardarLocal(CLAVE_PRODUCTOS, productos);
  return { ok: true };
}
