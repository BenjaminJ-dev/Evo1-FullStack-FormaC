// ============================================================
// datos.js
// Datos "de fábrica" del sistema: usuarios internos y productos.
//
// IMPORTANTE (nota para el equipo):
// Todo esto es una SIMULACIÓN de backend hecha en el navegador.
// Los usuarios admin/operador están hardcodeados aquí solo para
// esta entrega. Cuando exista backend (Spring Boot + base de datos),
// esto se reemplazará por peticiones reales a una API y NUNCA se
// deben dejar contraseñas escritas así en el código.
// ============================================================

// Usuarios internos de la empresa (no se registran, ya existen)
const USUARIOS_SISTEMA = [
    { usuario: "admin", password: "admin123", rol: "admin", nombre: "Administrador General" },
    { usuario: "operador", password: "operador123", rol: "operador", nombre: "Operador de Turno" }
];

// Catálogo base de productos (se usa para inicializar el inventario)
const PRODUCTOS_BASE = [
    { id: "5KG", nombre: "Cilindro GLP 5KG", precio: 6000, stock: 25 },
    { id: "11KG", nombre: "Cilindro GLP 11KG", precio: 11000, stock: 30 },
    { id: "15KG", nombre: "Cilindro GLP 15KG", precio: 14500, stock: 20 },
    { id: "45KG", nombre: "Cilindro GLP 45KG", precio: 40000, stock: 8 }
];

// -------------------- Helpers de localStorage --------------------
// Todo el "guardado" del sistema vive en localStorage mientras no
// exista backend. Se centralizan aquí las claves para no repetirlas.

const CLAVE_CLIENTES = "gasVolcan_clientes";
const CLAVE_PEDIDOS = "gasVolcan_pedidos";
const CLAVE_INVENTARIO = "gasVolcan_inventario";
const CLAVE_SESION = "gasVolcan_sesion";

// Devuelve la lista de clientes registrados (array vacío si no hay nada aún)
function obtenerClientes() {
    const datos = localStorage.getItem(CLAVE_CLIENTES);
    return datos ? JSON.parse(datos) : [];
}

// Devuelve la lista de pedidos realizados (array vacío si no hay nada aún)
function obtenerPedidos() {
    const datos = localStorage.getItem(CLAVE_PEDIDOS);
    return datos ? JSON.parse(datos) : [];
}

// Devuelve el inventario actual. Si es la primera vez que se usa el
// sistema, lo inicializa con PRODUCTOS_BASE.
function obtenerInventario() {
    const datos = localStorage.getItem(CLAVE_INVENTARIO);
    if (datos) {
        return JSON.parse(datos);
    }
    localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(PRODUCTOS_BASE));
    return PRODUCTOS_BASE;
}

// Guarda la sesión activa (usuario, rol, nombre) en sessionStorage.
// Se usa sessionStorage (no localStorage) para que la sesión se
// cierre al cerrar la pestaña, simulando un inicio de sesión real.
function guardarSesion(sesion) {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

function obtenerSesion() {
    const datos = sessionStorage.getItem(CLAVE_SESION);
    return datos ? JSON.parse(datos) : null;
}

function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_SESION);
}

// ------------------------------------------------------------
// exigirSesion(rolesPermitidos)
// Protege cualquier página: si no hay sesión activa, o si el rol de
// la sesión no está dentro de rolesPermitidos, redirige a login.html
// de inmediato. Se usa una sola línea al inicio del script de cada
// página protegida, en vez de repetir el mismo "if" en cada archivo.
//
// Ejemplo de uso en una página de cliente:
//   const sesion = exigirSesion(["cliente"]);
//
// Devuelve el objeto de sesión si todo está bien, para que la página
// pueda usarlo (ej. mostrar el nombre del usuario).
// ------------------------------------------------------------
function exigirSesion(rolesPermitidos) {
    const sesion = obtenerSesion();
    if (!sesion || !rolesPermitidos.includes(sesion.rol)) {
        window.location.href = "login.html";
        return null;
    }
    return sesion;
}
