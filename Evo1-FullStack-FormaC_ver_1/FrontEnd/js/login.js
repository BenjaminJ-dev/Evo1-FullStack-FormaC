// ============================================================
// login.js
// Validaciones del formulario de login y redirección según el rol.
//
// SIMULACIÓN LOCAL: no existe backend todavía, por lo tanto la
// verificación de usuario/contraseña se hace comparando contra
// USUARIOS_SISTEMA (hardcodeado en datos.js) y contra los clientes
// guardados en localStorage. Cuando exista backend, este bloque de
// verificación se reemplazará por un fetch a un endpoint de login
// que devuelva un token de sesión real.
// ============================================================

const formularioLogin = document.getElementById("formularioLogin");

formularioLogin.addEventListener("submit", function (event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");

    // Validación: usuario vacío
    if (usuario === "") {
        mensaje.textContent = "Debes ingresar tu usuario.";
        return;
    }
    // Validación: contraseña vacía
    if (password === "") {
        mensaje.textContent = "Debes ingresar tu contraseña.";
        return;
    }

    // 1. Buscar primero entre los usuarios internos (admin / operador)
    let usuarioEncontrado = USUARIOS_SISTEMA.find(
        (u) => u.usuario === usuario && u.password === password
    );

    // 2. Si no está ahí, buscar entre los clientes registrados
    if (!usuarioEncontrado) {
        const clientes = obtenerClientes();
        const cliente = clientes.find(
            (c) => c.usuario === usuario && c.password === password
        );
        if (cliente) {
            usuarioEncontrado = { usuario: cliente.usuario, rol: "cliente", nombre: cliente.nombre };
        }
    }

    // Credenciales incorrectas
    if (!usuarioEncontrado) {
        mensaje.textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    // Login correcto: guardamos la sesión y redirigimos según el rol
    guardarSesion(usuarioEncontrado);

    if (usuarioEncontrado.rol === "admin") {
        window.location.href = "admin.html";
    } else if (usuarioEncontrado.rol === "operador") {
        window.location.href = "operador.html";
    } else {
        window.location.href = "index.html";
    }
});
