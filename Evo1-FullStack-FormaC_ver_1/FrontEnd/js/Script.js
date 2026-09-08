// ============================================================
// Script.js
// Validaciones del formulario de pedido + guardado en localStorage
// para que el Operador pueda verlo en su panel.
//
// SIMULACIÓN LOCAL: al no existir backend, el pedido se guarda en
// localStorage. Cuando exista backend, este bloque se reemplazará
// por un fetch (POST) a un endpoint tipo /api/pedidos que guarde
// el pedido en la base de datos real.
// ============================================================

const formulario = document.getElementById("formularioPedido");

// Protección de la vista: solo un cliente logueado puede pedir.
// (exigirSesion está definida en datos.js)
const sesion = exigirSesion(["cliente"]);
if (sesion) {
    document.getElementById("saludoCliente").textContent = "Hola, " + sesion.nombre;
    // Se prellena el nombre con el del usuario logueado, ya que el
    // sistema debería saber quién es sin que lo vuelva a escribir.
    document.getElementById("nombre").value = sesion.nombre;
}
document.getElementById("botonCerrarSesion").addEventListener("click", function () {
    cerrarSesion();
});

// Si venimos desde "Comprar" en productos.html, se preselecciona
// el cilindro correspondiente usando el parámetro ?cilindro= de la URL.
const parametros = new URLSearchParams(window.location.search);
const cilindroPreseleccionado = parametros.get("cilindro");
if (cilindroPreseleccionado) {
    document.getElementById("cilindro").value = cilindroPreseleccionado;
}

formulario.addEventListener("submit", function(event){
    event.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;
    const cilindro = document.getElementById("cilindro").value;
    const cantidad = document.getElementById("cantidad").value;

    const mensaje= document.getElementById("mensaje");

    // validacion de nombre
    if(nombre === ""){
        mensaje.textContent ="debes ingresar tu nombre.";
        return;
    }
    //telefono
    if (telefono ===""){
        mensaje.textContent="debes ingresar tu telefono.";
        return;
    }//direccion
    if (direccion ===""){
        mensaje.textContent ="debes ingresar tu direccion";
        return;
    }
    //cilindro
    if (cilindro === ""){
        mensaje.textContent= "debes seleccionar un cilindro";
        return;
    }
    //Cantidad de cilindros
    if(cantidad === "" || cantidad <1 || cantidad > 10){
        mensaje.textContent = "debes ingresar una cantidad valida.";
        return;
    }

    // si todo esta ok: se arma el pedido y se guarda en localStorage
    // (obtenerPedidos y CLAVE_PEDIDOS vienen de datos.js)
    const pedidos = obtenerPedidos();
    const nuevoPedido = {
        id: Date.now(),
        usuario: sesion.usuario,
        nombre: nombre,
        telefono: telefono,
        direccion: direccion,
        cilindro: cilindro,
        cantidad: cantidad,
        estado: "Pendiente",
        fecha: new Date().toLocaleString("es-CL")
    };
    pedidos.push(nuevoPedido);
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos));

    mensaje.textContent ="Pedido registrado correctamente"
    formulario.reset();

}
)
