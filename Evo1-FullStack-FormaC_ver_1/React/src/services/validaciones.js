// src/services/validaciones.js
// Reglas de validación de datos. Funciones simples: reciben un valor y
// devuelven true/false. Los mensajes de error los arma quien las usa.
import { MAX_CANTIDAD } from '../constantes';

// Teléfono: solo números, 9 dígitos (celular chileno sin el +56)
export function validarTelefono(valor) {
  return /^[0-9]{9}$/.test(valor);
}

// Usuario: solo letras, números y guion bajo, mínimo 4 caracteres
export function validarUsuario(valor) {
  return /^[a-zA-Z0-9_]{4,}$/.test(valor);
}

// Cantidad: número entero entre 1 y el máximo permitido
export function validarCantidad(valor, maximo = MAX_CANTIDAD) {
  return Number.isInteger(valor) && valor >= 1 && valor <= maximo;
}
