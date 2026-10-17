# Distribuidora de Gas El Volcán — Frontend (React + Bootstrap)

Sitio web de la distribuidora de gas licuado "El Volcán" (Chillán), proyecto académico
DSY1104 — Desarrollo FullStack II (Evaluación Parcial N°2). Es la migración del sitio
HTML/CSS/JS de la Parcial 1 a **React**, con **Bootstrap** para el diseño responsivo y
**Vitest** para las pruebas unitarias.

Es un proyecto **solo frontend**: no hay servidor ni base de datos. Los datos (clientes, pedidos,
inventario, sesión) se guardan en el navegador (`localStorage` / `sessionStorage`) y están
aislados en la carpeta `src/services/`, con comentarios `TODO backend` donde irá la API real.

## Cómo usarlo

```bash
npm install          # instala dependencias (una sola vez)
npm run dev          # abre el sitio en modo desarrollo (http://localhost:5173)
npm test             # ejecuta las 14 pruebas unitarias
npm run coverage     # pruebas + reporte de cobertura (carpeta coverage/)
npm run build        # genera la versión de producción (carpeta dist/)
```

Requiere Node.js 20.19 o superior.

## Stack

React 19 · Vite · react-bootstrap / Bootstrap 5 · react-router-dom · Vitest + Testing Library + jsdom

## Estructura (resumen; el mapa completo está en `Mapa_Proyecto_gas-el-volcan.txt`)

```
src/
  main.jsx          punto de entrada: estilos + BrowserRouter + proveedores de estado global
  App.jsx           rutas y rol permitido en cada una
  constantes.js     ROLES, ESTADOS, MAX_CANTIDAD, claves de almacenamiento, PRODUCTOS_BASE
  services/         TODA la lógica de negocio y los datos (hoy localStorage, mañana la API)
  context/          estado global: sesión y avisos (banner)
  hooks/            useCarrito, usePedidos, useInventario
  components/       piezas reutilizables (formularios, carrito, tablas, layout...)
  pages/            una por ruta; solo arman componentes
  styles/temas.css  los 3 temas de color
```

Idea central: **los componentes muestran, los servicios deciden.** Cada regla de negocio existe
en un solo lugar (por ejemplo `sePuedeCancelar` en `pedidosServicio.js`) y los componentes solo la llaman.

## Roles y credenciales de prueba

| Rol | Cómo se obtiene | Entra a |
|---|---|---|
| Cliente | Se registra en `/registro` | `/`, `/productos`, `/pedido`, `/mis-pedidos` |
| Operador | `operador` / `operador123` | `/operador` |
| Administrador | `admin` / `admin123` | `/admin` |

Todo parte desde `/login`. Sin sesión, cualquier otra ruta redirige al login (`RutaProtegida`).
El diseño es el mismo para todos; solo cambia el color: cliente naranja, operador grises, admin azul marino.

## Reglas de negocio

- **Carrito** (en `/pedido`): el cliente agrega cilindros, edita cantidades (− / +) y quita ítems antes de
  confirmar. Si agrega un cilindro que ya tiene, se suma a la línea existente. Máximo **4 cilindros por pedido**
  (total del carrito). Muestra subtotal por ítem y total, sin medio de pago.
- **Al confirmar** se validan teléfono (9 dígitos), dirección y **stock**. Si falta stock, el pedido completo se
  rechaza, se nombra el producto sin stock y el cliente sigue en la página con su carrito intacto.
- **Pedido enviado = no modificable.** Un pedido es uno solo con varios ítems; si el cliente quiere algo más, hace otro.
- **Seguimiento:** Pendiente → En camino → Entregado (lo avanza el operador).
- **Cancelación:** cliente y operador pueden cancelar un ítem suelto o el pedido completo, **solo mientras esté
  "Pendiente"**, con confirmación. Si se cancela el último ítem activo, el pedido pasa a "Cancelado".
- **Inventario en 3 columnas:** `Total = Pendiente a enviar + Disponible a enviar`.
  *Total* es el stock físico (baja solo al entregar); *Pendiente* y *Disponible* se calculan desde los pedidos
  (no se guardan aparte, así no se desincronizan). Ítems cancelados no cuentan.
- Cada ítem guarda el **precio del momento**, así un cambio de precio futuro no altera el historial.
- Los accesorios (regulador, manguera, detector) están **comentados** en `constantes.js` hasta decidir cómo
  integrarlos al inventario.

## Pruebas (Vitest)

14 pruebas en 6 archivos, cada uno junto al código que prueba:

| Archivo | Pruebas | Qué verifica |
|---|---|---|
| `services/validaciones.test.js` | 3 | teléfono, usuario y cantidad |
| `services/pedidosServicio.test.js` | 4 | inventario calculado, cancelación, rechazo sin stock, Total al entregar |
| `hooks/useCarrito.test.js` | 3 | agregar/sumar, máximo de 4, editar y quitar |
| `components/RutaProtegida.test.jsx` | 2 | redirección sin sesión / rol incorrecto, y acceso permitido |
| `components/FormularioLogin.test.jsx` | 1 | avisos de error del login |
| `components/TablaPedidos.test.jsx` | 1 | confirmación antes de cancelar |

**Mocks usados:** `window.confirm` (`vi.spyOn`), funciones espía (`vi.fn`), router en memoria (`MemoryRouter`) y
almacenamiento del navegador limpio entre pruebas (`setupTests.js`).

**Cobertura actual** (`npm run coverage`): 47% de sentencias en total. Está concentrada donde está la lógica:
`pedidosServicio` ~88%, `validaciones`, `constantes` y `RutaProtegida` 100%. Las páginas no tienen pruebas propias
(0%), porque las 14 pruebas se enfocaron en reglas de negocio y componentes clave. Se verificó además el flujo
completo (registro → pedido → cancelar → operador → admin) con una prueba de humo temporal, no incluida en la entrega.

## Pendientes y limitaciones conocidas

- **Administración:** "Gestión de usuarios", "Precios e inventario" y "Reportes" son solo esqueleto visual.
- **`sessionStorage` es por pestaña:** abrir una pestaña nueva pide iniciar sesión de nuevo. Se resolverá con
  backend real (token de sesión validado en el servidor).
- **Seguridad:** las contraseñas están en texto plano y la protección de rutas vive en el navegador. Es solo una
  simulación para esta etapa; con backend se hará en el servidor.
- **Video de Inicio:** el enlace de YouTube es un marcador (`TODO`); reemplazar por el video real de la empresa.
- **Herramienta de pruebas:** la rúbrica nombra Jasmine/Karma, pero la plantilla del documento de cobertura usa
  Vitest. Se usó Vitest; confirmar con el profesor.
- Documentos pendientes: ERS final y Documento de Cobertura del Testing (se completa con los resultados de `npm run coverage`).
- A futuro: backend real, mapa de entregas, reportes.
