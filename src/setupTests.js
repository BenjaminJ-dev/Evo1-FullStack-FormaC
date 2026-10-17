// src/setupTests.js
// Se ejecuta antes de cada archivo de pruebas.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cada prueba parte con el navegador "limpio": sin datos guardados.
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
