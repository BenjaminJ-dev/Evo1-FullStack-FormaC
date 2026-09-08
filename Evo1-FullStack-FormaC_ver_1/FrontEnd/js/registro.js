// ============================================================
// registro.js
// Validaciones del formulario de registro de clientes y guardado
// en localStorage.
//
// SIMULACIÓN LOCAL: al no existir backend, el nuevo cliente se
// guarda directamente en localStorage. Cuando exista backend, este
// bloque se reemplazará por un fetch (POST) a un endpoint tipo
// /api/usuarios que guarde el usuario en la base de datos real,
// con la contraseña encriptada en el servidor (nunca en texto plano).
// ============================================================

const formularioRegistro = document.getElementById("formularioRegistro");

formularioRegistro.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;
    const confirmarPassword = document.getElementById("confirmarPassword").value;
    const mensaje = document.getElementById("mensaje");

    // Validación: nombre
    if (nombre === "") {
        mensaje.textContent = "Debes ingresar tu nombre completo.";
        return;
    }
    // Validación: usuario
    if (usuario === "") {
        mensaje.textContent = "Debes ingresar un nombre de usuario.";
        return;
    }
    // Validación: contraseña con largo mínimo
    if (password === "" || password.length < 6) {
        mensaje.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }
    // Validación: confirmación de contraseña
    if (confirmarPassword === "" || confirmarPassword !== password) {
        mensaje.textContent = "Las contraseñas no coinciden.";
        return;
    }

    // Validación: que el usuario no exista ya (ni en internos ni en clientes)
    const usuarioYaExisteInterno = USUARIOS_SISTEMA.some((u) => u.usuario === usuario);
    const clientes = obtenerClientes();
    const usuarioYaExisteCliente = clientes.some((c) => c.usuario === usuario);

    if (usuarioYaExisteInterno || usuarioYaExisteCliente) {
        mensaje.textContent = "Ese nombre de usuario ya está en uso, elige otro.";
        return;
    }

    // Todo correcto: guardamos el nuevo cliente en localStorage
    const nuevoCliente = { nombre: nombre, usuario: usuario, password: password };
    clientes.push(nuevoCliente);
    localStorage.setItem(CLAVE_CLIENTES, JSON.stringify(clientes));

    mensaje.textContent = "Cuenta creada correctamente. Serás redirigido para iniciar sesión...";
    formularioRegistro.reset();

    // Pequeña espera para que la persona alcance a leer el mensaje
    setTimeout(function () {
        window.location.href = "login.html";
    }, 1500);
});
