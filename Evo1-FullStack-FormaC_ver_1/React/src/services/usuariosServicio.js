// src/services/usuariosServicio.js
// Usuarios, login, registro y sesión.
//
// TODO backend: USUARIOS_INTERNOS y las contraseñas en texto plano existen
// solo para esta etapa sin servidor. Con backend real, el login será una
// petición (POST /login) que devuelva un token, y las contraseñas se guardan
// encriptadas en el servidor. Nunca se deben dejar así en un sistema real.
import { CLAVES, ROLES } from '../constantes';
import {
  leerLocal,
  guardarLocal,
  leerSesionNavegador,
  guardarSesionNavegador,
  borrarSesionNavegador,
} from './almacenamiento';

// Usuarios de la empresa (no se registran, ya existen)
export const USUARIOS_INTERNOS = [
  { usuario: 'admin', password: 'admin123', rol: ROLES.ADMIN, nombre: 'Administrador General' },
  { usuario: 'operador', password: 'operador123', rol: ROLES.OPERADOR, nombre: 'Operador de Turno' },
];

export function obtenerClientes() {
  return leerLocal(CLAVES.CLIENTES, []);
}

export function usuarioExiste(usuario) {
  const esInterno = USUARIOS_INTERNOS.some((u) => u.usuario === usuario);
  const esCliente = obtenerClientes().some((c) => c.usuario === usuario);
  return esInterno || esCliente;
}

// Devuelve la sesión { usuario, rol, nombre } si las credenciales son correctas, o null.
export function autenticar(usuario, password) {
  const interno = USUARIOS_INTERNOS.find((u) => u.usuario === usuario && u.password === password);
  if (interno) {
    return { usuario: interno.usuario, rol: interno.rol, nombre: interno.nombre };
  }
  const cliente = obtenerClientes().find((c) => c.usuario === usuario && c.password === password);
  if (cliente) {
    return { usuario: cliente.usuario, rol: ROLES.CLIENTE, nombre: cliente.nombre };
  }
  return null;
}

export function registrarCliente({ nombre, usuario, password }) {
  if (usuarioExiste(usuario)) {
    return { ok: false, error: 'Ese nombre de usuario ya está en uso, elige otro.' };
  }
  const clientes = obtenerClientes();
  clientes.push({ nombre, usuario, password });
  guardarLocal(CLAVES.CLIENTES, clientes);
  return { ok: true };
}

// --- Sesión (dura mientras la pestaña esté abierta) ---
// Limitación conocida: sessionStorage es por pestaña. Se resolverá con un
// token de sesión validado en el servidor cuando exista backend.
export function obtenerSesion() {
  return leerSesionNavegador(CLAVES.SESION, null);
}

export function guardarSesion(sesion) {
  guardarSesionNavegador(CLAVES.SESION, sesion);
}

export function cerrarSesion() {
  borrarSesionNavegador(CLAVES.SESION);
}

// A qué página va cada rol al iniciar sesión (o si ya la tiene iniciada)
export function rutaInicioPorRol(rol) {
  if (rol === ROLES.CLIENTE) return '/';
  if (rol === ROLES.OPERADOR) return '/operador';
  if (rol === ROLES.ADMIN) return '/admin';
  return '/login';
}
