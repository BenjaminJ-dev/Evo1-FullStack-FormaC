// src/services/validaciones.test.js
// Pruebas de las reglas de validación (funciones puras, sin mocks).
import { validarCantidad, validarTelefono, validarUsuario } from './validaciones';

describe('validaciones', () => {
  it('acepta solo teléfonos de 9 dígitos numéricos', () => {
    expect(validarTelefono('912345678')).toBe(true);
    expect(validarTelefono('91234567')).toBe(false);   // muy corto
    expect(validarTelefono('9123456789')).toBe(false); // muy largo
    expect(validarTelefono('91234abc8')).toBe(false);  // con letras
    expect(validarTelefono('9123 5678')).toBe(false);  // con espacio
  });

  it('acepta usuarios de 4+ caracteres con letras, números y guion bajo', () => {
    expect(validarUsuario('juan_perez1')).toBe(true);
    expect(validarUsuario('abc')).toBe(false);          // muy corto
    expect(validarUsuario('juan perez')).toBe(false);   // con espacio
    expect(validarUsuario('juan!!')).toBe(false);       // con símbolos
  });

  it('acepta cantidades enteras entre 1 y el máximo (4 por defecto)', () => {
    expect(validarCantidad(1)).toBe(true);
    expect(validarCantidad(4)).toBe(true);
    expect(validarCantidad(0)).toBe(false);
    expect(validarCantidad(5)).toBe(false);
    expect(validarCantidad(2.5)).toBe(false);           // no entero
    expect(validarCantidad(3, 2)).toBe(false);          // respeta un máximo distinto
  });
});
