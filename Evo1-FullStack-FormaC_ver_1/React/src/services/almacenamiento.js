// src/services/almacenamiento.js
// Lectura y escritura en el navegador (localStorage / sessionStorage).
//
// TODO backend: cuando exista una API real, los servicios dejarán de usar
// este archivo y harán peticiones HTTP. Los componentes no se enteran.

function leer(almacen, clave, valorPorDefecto) {
  try {
    const texto = almacen.getItem(clave);
    return texto ? JSON.parse(texto) : valorPorDefecto;
  } catch {
    // Si el dato guardado está corrupto, se parte de cero en vez de romper la app.
    return valorPorDefecto;
  }
}

// Datos que deben durar siempre (clientes, pedidos, inventario)
export function leerLocal(clave, valorPorDefecto) {
  return leer(localStorage, clave, valorPorDefecto);
}

export function guardarLocal(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

// Datos que se borran al cerrar la pestaña (la sesión)
export function leerSesionNavegador(clave, valorPorDefecto) {
  return leer(sessionStorage, clave, valorPorDefecto);
}

export function guardarSesionNavegador(clave, valor) {
  sessionStorage.setItem(clave, JSON.stringify(valor));
}

export function borrarSesionNavegador(clave) {
  sessionStorage.removeItem(clave);
}
