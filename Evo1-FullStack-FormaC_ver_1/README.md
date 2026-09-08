# Distribuidora de Gas El Volcán — Frontend

Sitio web para la distribuidora de gas licuado "El Volcán" (Chillán),
desarrollado como proyecto académico para el curso **DSY1104 —
Desarrollo FullStack II** (Evaluación Parcial N°1, Forma C).

Es un proyecto **100% frontend** (HTML, CSS y JavaScript puro), sin
backend ni base de datos real. Todo lo que normalmente guardaría un
servidor (usuarios, pedidos, inventario, sesión) se simula con
`localStorage` y `sessionStorage` del navegador. Los lugares donde en
el futuro iría una llamada real a una API están marcados con
comentarios `// TODO` en el código.

## Estructura del proyecto

```
FrontEnd/
├── html/
│   ├── login.html          Punto de entrada del sitio
│   ├── registro.html       Registro de nuevos clientes
│   ├── index.html          Inicio (solo clientes logueados)
│   ├── productos.html      Catálogo (solo clientes logueados)
│   ├── pedido.html         Formulario de pedido (solo clientes logueados)
│   ├── mis-pedidos.html    Historial de pedidos del cliente
│   ├── admin.html          Panel de Administración
│   └── operador.html       Panel de Operador
├── js/
│   ├── datos.js            Usuarios hardcodeados, productos base y helpers de localStorage
│   ├── login.js            Validación de login y redirección por rol
│   ├── registro.js         Validación y registro de clientes
│   ├── Script.js           Validación del formulario de pedido
│   ├── operador.js         Lógica del panel de Operador
│   └── mis-pedidos.js      Historial de pedidos del cliente
└── assets/
    ├── estilos.css          Tema del sitio de cliente (naranja)
    ├── estilos-operador.css Tema del panel de Operador (grises apagados)
    ├── estilos-admin.css    Tema del panel de Administración (azul marino)
    ├── camion-gas.svg
    └── cilindro-gas.svg
```

## Roles y flujo de navegación

Todo el sitio parte desde **`login.html`**. Según el rol del usuario
que inicia sesión, se le redirige a una parte distinta del sitio:

| Rol | Cómo se obtiene | A dónde entra |
|---|---|---|
| **Cliente** | Se registra en `registro.html` | `index.html`, `productos.html`, `pedido.html`, `mis-pedidos.html` |
| **Operador** | Usuario interno (hardcodeado) | `operador.html` |
| **Administrador** | Usuario interno (hardcodeado) | `admin.html` |

**Ninguna página puede verse sin haber iniciado sesión** (excepto
`login.html` y `registro.html`). Esto se controla con una única
función centralizada, `exigirSesion(rolesPermitidos)` (en `datos.js`),
que cada página llama al cargar; si no hay sesión válida para ese rol,
redirige automáticamente a `login.html`.

### Credenciales de prueba

Usuarios internos hardcodeados en `js/datos.js`:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `operador` | `operador123` | Operador |

Los clientes no tienen usuario de prueba: hay que crearlos desde
"Regístrate aquí" en `login.html`.

## Qué puede hacer cada rol

**Cliente**
- Ver inicio y catálogo de productos.
- Realizar un pedido (el formulario valida cada campo y queda
  enlazado al usuario que inició sesión).
- Ver "Mis pedidos": historial de solo lectura de sus propios pedidos,
  con el estado de cada uno (Pendiente / En camino / Entregado).
- Cerrar sesión desde cualquier página.

**Operador**
- Ver la lista completa de pedidos realizados por todos los clientes.
- Avanzar el estado de cada pedido (Pendiente → En camino → Entregado).
  Al marcar un pedido como "Entregado", se descuenta stock del
  inventario automáticamente.
- Ver el inventario de productos con su stock actual.

**Administrador**
- Panel con apartados de "Gestión de usuarios" y "Reportes" como
  **placeholders** (solo la estructura visual, sin funcionalidad),
  marcados con `<!-- TODO -->` para una entrega futura donde se
  implementará la creación/edición/desactivación de usuarios
  conectada a un backend real.

## Simulación de datos (sin backend)

Todo se guarda en el navegador:

| Dato | Dónde vive | Clave usada |
|---|---|---|
| Usuarios internos (admin/operador) | Hardcodeado en `datos.js` | `USUARIOS_SISTEMA` |
| Productos base | Hardcodeado en `datos.js` | `PRODUCTOS_BASE` |
| Clientes registrados | `localStorage` | `gasVolcan_clientes` |
| Pedidos realizados | `localStorage` | `gasVolcan_pedidos` |
| Inventario (con stock actualizado) | `localStorage` | `gasVolcan_inventario` |
| Sesión activa | `sessionStorage` | `gasVolcan_sesion` |

Se usa `sessionStorage` para la sesión (no `localStorage`) para que se
cierre automáticamente al cerrar la pestaña del navegador, simulando
un inicio de sesión real.

> **Nota:** esto es una simulación pensada solo para esta entrega.
> No es seguro (las contraseñas están en texto plano en el código y en
> `localStorage`) y no debe usarse así en un sistema real. Cuando
> exista backend (Spring Boot + base de datos), todo esto se
> reemplazará por peticiones a una API real con autenticación segura.

## Cómo probarlo

1. Abrir `FrontEnd/html/login.html` en el navegador.
2. Iniciar sesión con `operador` / `operador123` para ver el panel de
   pedidos e inventario, o con `admin` / `admin123` para ver el panel
   de administración.
3. Para probar como cliente: hacer clic en "Regístrate aquí", crear una
   cuenta, iniciar sesión con ella, hacer un pedido en `pedido.html` y
   luego revisarlo en "Mis pedidos".
4. Para ver el flujo completo operador–cliente: crear un pedido como
   cliente, luego entrar como `operador` y avanzar su estado — el
   cambio se refleja al instante en la tabla y en el inventario.

## Pendientes para entregas futuras

- Módulo de gestión de usuarios en `admin.html` (crear, editar,
  desactivar clientes y operadores).
- Reportes en el panel de administración.
- Reemplazar toda la simulación en `localStorage`/`sessionStorage` por
  un backend real (Spring Boot, microservicios, base de datos
  normalizada, autenticación con roles y tokens).
- Integración de mapa (Leaflet/Google Maps) para seguimiento de
  entregas en tiempo real.
