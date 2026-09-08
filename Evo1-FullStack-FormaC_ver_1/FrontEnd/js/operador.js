// ============================================================
// operador.js
// Lógica del panel de Operador: ver pedidos, actualizar su estado
// (seguimiento) y ver el inventario. Todo simulado con localStorage.
//
// SIMULACIÓN LOCAL: cuando exista backend, obtenerPedidos()/
// obtenerInventario() se reemplazarán por peticiones GET a la API
// (ej. /api/pedidos, /api/inventario), y actualizarEstadoPedido()
// por una petición PUT/PATCH que actualice el pedido en la base
// de datos real.
// ============================================================

// ------------------------------------------------------------
// Protección de la vista: solo rol "operador" puede entrar.
// (exigirSesion está definida en datos.js)
// ------------------------------------------------------------
const sesion = exigirSesion(["operador"]);
if (sesion) {
    document.getElementById("saludoOperador").textContent = "Hola, " + sesion.nombre;
}

document.getElementById("botonCerrarSesion").addEventListener("click", function () {
    cerrarSesion();
});

// Orden de los estados posibles de un pedido, usado para "avanzar"
const ORDEN_ESTADOS = ["Pendiente", "En camino", "Entregado"];

function claseEstado(estado) {
    if (estado === "Pendiente") return "estado estado-pendiente";
    if (estado === "En camino") return "estado estado-en-camino";
    return "estado estado-entregado";
}

// Dibuja la tabla de pedidos completa a partir de lo que hay en localStorage
function renderizarPedidos() {
    const pedidos = obtenerPedidos();
    const cuerpo = document.getElementById("cuerpoTablaPedidos");
    const mensaje = document.getElementById("mensajePedidos");
    cuerpo.innerHTML = "";

    if (pedidos.length === 0) {
        mensaje.textContent = "Todavía no hay pedidos registrados.";
        return;
    }
    mensaje.textContent = "";

    pedidos.forEach(function (pedido) {
        const fila = document.createElement("tr");

        const siguienteEstadoIndex = ORDEN_ESTADOS.indexOf(pedido.estado) + 1;
        const haySiguiente = siguienteEstadoIndex < ORDEN_ESTADOS.length;
        const textoBoton = haySiguiente
            ? "Marcar " + ORDEN_ESTADOS[siguienteEstadoIndex].toLowerCase()
            : "Entregado";

        fila.innerHTML =
            "<td>" + pedido.nombre + "</td>" +
            "<td>" + pedido.direccion + "</td>" +
            "<td>" + pedido.cilindro + "</td>" +
            "<td>" + pedido.cantidad + "</td>" +
            "<td><span class='" + claseEstado(pedido.estado) + "'>" + pedido.estado + "</span></td>" +
            "<td><button type='button' class='botonAvanzarEstado' data-id='" + pedido.id + "' " +
            (haySiguiente ? "" : "disabled") + ">" + textoBoton + "</button></td>";

        cuerpo.appendChild(fila);
    });

    // Se enlazan los botones recién creados con su acción
    document.querySelectorAll(".botonAvanzarEstado").forEach(function (boton) {
        boton.addEventListener("click", function () {
            avanzarEstadoPedido(boton.getAttribute("data-id"));
        });
    });
}

// Avanza el estado de un pedido y, si queda "Entregado", descuenta stock
function avanzarEstadoPedido(idPedido) {
    const pedidos = obtenerPedidos();
    const pedido = pedidos.find(function (p) { return String(p.id) === String(idPedido); });
    if (!pedido) return;

    const indexActual = ORDEN_ESTADOS.indexOf(pedido.estado);
    const siguienteIndex = indexActual + 1;
    if (siguienteIndex >= ORDEN_ESTADOS.length) return;

    pedido.estado = ORDEN_ESTADOS[siguienteIndex];
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos));

    // Si el pedido quedó "Entregado", se descuenta stock del inventario
    if (pedido.estado === "Entregado") {
        descontarStock(pedido.cilindro, pedido.cantidad);
    }

    // Se vuelve a dibujar todo para reflejar el cambio al instante
    renderizarPedidos();
    renderizarInventario();
}

// Dibuja la tabla de inventario a partir de lo que hay en localStorage
function renderizarInventario() {
    const inventario = obtenerInventario();
    const cuerpo = document.getElementById("cuerpoTablaInventario");
    cuerpo.innerHTML = "";

    inventario.forEach(function (producto) {
        const fila = document.createElement("tr");
        fila.innerHTML =
            "<td>" + producto.nombre + "</td>" +
            "<td>$" + producto.precio.toLocaleString("es-CL") + "</td>" +
            "<td>" + producto.stock + " unidades</td>";
        cuerpo.appendChild(fila);
    });
}

// Descuenta stock del producto correspondiente al tipo de cilindro
function descontarStock(idCilindro, cantidad) {
    const inventario = obtenerInventario();
    const producto = inventario.find(function (p) { return p.id === idCilindro; });
    if (!producto) return;

    producto.stock = Math.max(0, producto.stock - Number(cantidad));
    localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(inventario));
}

// Primer dibujo de las tablas al cargar la página
renderizarPedidos();
renderizarInventario();
