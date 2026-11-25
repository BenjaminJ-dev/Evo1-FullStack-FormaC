import { CLAVES, ROLES } from '../constantes';
import { leerLocal } from './almacenamiento';
import { clienteApi } from './clienteApi';

const CLAVE_AUTH = 'gasVolcan_auth_v1';
const roles = { CLIENTE: ROLES.CLIENTE, OPERADOR: ROLES.OPERADOR, ADMINISTRADOR: ROLES.ADMIN };

export function obtenerSesion() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_AUTH));
    if (!datos?.accessToken || !datos?.refreshToken || !roles[datos.rol]) return null;
    return { ...datos, usuario: datos.username, rol: roles[datos.rol] };
  } catch { return null; }
}
export function guardarSesion(datos) { localStorage.setItem(CLAVE_AUTH, JSON.stringify(datos)); window.dispatchEvent(new Event('sesion-actualizada')); }
export function borrarSesion() { localStorage.removeItem(CLAVE_AUTH); window.dispatchEvent(new Event('sesion-expirada')); }
export async function autenticar(usuario, password) { const { data } = await clienteApi.post('/auth/login', { usuario, password }); guardarSesion(data); return obtenerSesion(); }
export async function registrarCliente({ nombre, usuario, password }) { await clienteApi.post('/auth/registro', { nombre, usuario, password }); return { ok: true }; }
export async function cerrarSesion() { const token = obtenerSesion()?.refreshToken; try { if (token) await clienteApi.post('/auth/logout', { refreshToken: token }); } finally { borrarSesion(); } }
export function rutaInicioPorRol(rol) { if (rol === ROLES.CLIENTE) return '/'; if (rol === ROLES.OPERADOR) return '/operador'; if (rol === ROLES.ADMIN) return '/admin'; return '/login'; }
// Vista administrativa local provisional; no autentica ni otorga permisos del servidor.
export function obtenerUsuariosAdministracion() { if (obtenerSesion()?.rol !== ROLES.ADMIN) return []; return leerLocal(CLAVES.CLIENTES, []).map(c => ({ nombre: c.nombre, usuario: c.usuario, rol: ROLES.CLIENTE })); }
