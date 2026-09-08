// ============================================================
// mis-pedidos.js
// Historial de pedidos del cliente logueado: solo lectura, filtrado
// por el usuario de la sesión activa.
//
// SIMULACIÓN LOCAL: cuando exista backend, obtenerPedidos() se
// reemplazará por un fetch a un endpoint tipo /api/pedidos?usuario=...
// que ya devuelva solo los pedidos del cliente autenticado.
// ============================================================

// Protección de la vista: solo un cliente logueado puede entrar.
const sesion = exigirSesion(["cliente"]);
if (sesion) {
    document.getElementById("saludoCliente").textContent = "Hola, " + sesion.nombre;
}
document.getElementById("botonCerrarSesion").addEventListener("click", function () {
    cerrarSesion();
});

// Mismo criterio de colores por estado que usa operador.js
function claseEstado(estado) {
    if (estado === "Pendiente") return "estado estado-pendiente";
    if (estado === "En camino") return "estado estado-en-camino";
    return "estado estado-entregado";
}

function renderizarMisPedidos() {
    if (!sesion) return;

    const todosLosPedidos = obtenerPedidos();
    const misPedidos = todosLosPedidos.filter(function (pedido) {
        return pedido.usuario === sesion.usuario;
    });

    const cuerpo = document.getElementById("cuerpoTablaMisPedidos");
    const mensaje = document.getElementById("mensajeMisPedidos");
    cuerpo.innerHTML = "";

    if (misPedidos.length === 0) {
        mensaje.innerHTML = "Aún no has realizado pedidos. <a href='pedido.html'>Realiza tu primer pedido aquí</a>.";
        return;
    }
    mensaje.textContent = "";

    misPedidos.forEach(function (pedido) {
        const fila = document.createElement("tr");
        fila.innerHTML =
            "<td>" + pedido.fecha + "</td>" +
            "<td>" + pedido.cilindro + "</td>" +
            "<td>" + pedido.cantidad + "</td>" +
            "<td>" + pedido.direccion + "</td>" +
            "<td><span class='" + claseEstado(pedido.estado) + "'>" + pedido.estado + "</span></td>";
        cuerpo.appendChild(fila);
    });
}

renderizarMisPedidos();
