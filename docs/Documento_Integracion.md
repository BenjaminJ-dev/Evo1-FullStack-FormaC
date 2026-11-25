# Documento de integración — Distribuidora de Gas El Volcán

**Asignatura:** DSY1104 Desarrollo FullStack II  
**Evaluación:** Parcial N.º 3  
**Alcance:** implementación y verificación técnica del frontend, la API y la persistencia. Los datos iniciales son de demostración; este documento no incluye secretos ni credenciales reales.

## 1. Arquitectura y tecnologías

```text
Navegador (React 19, React Router, Bootstrap)
  → servicios JavaScript y Axios (Bearer JWT, JSON, manejo de 401)
  → Spring Boot 4.1 (controladores REST, Spring Security, servicios)
  → Spring Data JPA → H2 (archivo local o memoria aislada en pruebas)
```

El frontend usa Vite 8, React Bootstrap, Axios y Vitest con Testing Library. El backend usa Java 21, Maven Wrapper, Spring Web MVC, Bean Validation, Spring Security OAuth2 Resource Server, JPA, H2 y springdoc OpenAPI. El navegador solo conserva el carrito temporal y tokens; pedidos, usuarios, productos e inventario operativos se leen de la API. Servicios JavaScript de la etapa anterior que aún contienen lógica local no son la fuente principal de las pantallas integradas. [**IE3.1.1, IE3.2.2**]

## 2. Modelo de datos y persistencia

| Entidad | Datos principales y relación |
| --- | --- |
| `Usuario` | Identificador, usuario único, nombre, hash BCrypt, rol y estado activo. Un usuario tiene varios pedidos y refresh tokens. |
| `Producto` | Identificador comercial, nombre, descripción, precio, estado activo y versión. Tiene un inventario y puede figurar en varios detalles. |
| `Inventario` | Relación uno a uno con producto mediante clave compartida; stock físico y versión. |
| `Pedido` | Relación muchos a uno con usuario; destinatario, teléfono, dirección, fecha UTC, estado y versión. Contiene varios detalles. |
| `DetallePedido` | Relación muchos a uno con pedido y producto; cantidad, nombre y precio históricos, marca de cancelación. Un producto aparece una sola vez por pedido. |
| `RefreshToken` | Relación muchos a uno con usuario; hash SHA-256 del token y vencimiento. |

Las entidades están en `backend/src/main/java/cl/elvolcan/entity/`, los repositorios en `repository/` y las operaciones transaccionales en `service/`. La aplicación no serializa entidades JPA directamente: los controladores devuelven DTO definidos en `dto/Contratos.java`. `application.properties` configura H2 en archivo (`jdbc:h2:file:./data/elvolcan;LOCK_TIMEOUT=10000;WRITE_DELAY=0`) y `ddl-auto=update` para la evaluación local. `DatosIniciales` añade cuatro cilindros si faltan y crea cuentas internas solo si se proporcionan sus contraseñas iniciales. No crea clientes ni pedidos ficticios. [**IE3.1.1**]

## 3. Comunicación frontend → backend

`src/services/clienteApi.js` crea un cliente Axios con base `VITE_API_URL` o `http://localhost:8080/api/v1` y timeout de diez segundos. El interceptor de petición añade `Authorization: Bearer <accessToken>` en rutas protegidas. El interceptor de respuesta, ante un 401, comparte un intento de `/auth/refresh` entre solicitudes simultáneas, guarda los tokens nuevos y reintenta una vez. Si falla, borra la sesión local.

Los adaptadores `pedidosApi.js`, `inventarioApi.js` y `adminApi.js` traducen respuestas técnicas a los datos de las pantallas. `PaginaProductos` y `PaginaPedido` cargan el catálogo desde `/productos`; `PaginaMisPedidos` consulta `/mis-pedidos`; `PaginaOperador` consulta `/pedidos`, `/inventario` y el catálogo público para el precio; `PaginaAdmin` consulta indicadores, usuarios, productos, pedidos e inventario. Los errores HTTP se muestran al usuario, y las acciones de pedido se bloquean durante el envío para evitar dobles pulsaciones. [**IE3.2.2**]

## 4. API REST, CRUD y Swagger

Todos los endpoints de negocio llevan el prefijo `/api/v1`.

| Método y ruta | Función | Acceso |
| --- | --- | --- |
| `GET /productos`, `GET /productos/{id}` | Catálogo activo y detalle | Público |
| `POST /auth/registro` | Crear cliente | Público |
| `POST /auth/login`, `/auth/refresh`, `/auth/logout` | Inicio, renovación y salida | Público; refresh/logout requieren token en el cuerpo |
| `GET /auth/me` | Comprobar identidad vigente | Autenticado |
| `POST /pedidos` | Crear pedido | Cliente |
| `GET /mis-pedidos` | Historial propio | Cliente |
| `GET /pedidos` | Listar pedidos | Operador y administrador |
| `GET /pedidos/{id}` | Consultar detalle | Propietario, operador y administrador |
| `PATCH /pedidos/{id}/estado` | Avanzar estado | Operador |
| `PATCH /pedidos/{id}/cancelacion` | Cancelar pedido pendiente | Propietario u operador |
| `PATCH /pedidos/{id}/detalles/{detalleId}/cancelacion` | Cancelar línea pendiente | Propietario u operador |
| `GET /inventario` | Stock físico, comprometido y disponible | Operador y administrador |
| `GET /admin/usuarios`, `/admin/indicadores`, `/admin/productos` | Consultas administrativas | Administrador |
| `POST /admin/productos` | Crear producto e inventario inicial | Administrador |
| `PUT /admin/productos/{id}` | Editar nombre, descripción y precio | Administrador |
| `DELETE /admin/productos/{id}` | Desactivar sin borrar historial | Administrador |

El CRUD evaluable corresponde a productos: lectura pública y administrativa, creación, actualización y eliminación lógica. Los pedidos exponen creación, lectura y transiciones/cancelación propias del dominio; no se elimina físicamente su historial. Los controladores están en `backend/src/main/java/cl/elvolcan/controller/`. Swagger UI está en `http://localhost:8080/swagger-ui/index.html` y el JSON OpenAPI en `/v3/api-docs`. `OpenApiConfig` registra el esquema `bearerAuth`; para demostrar rutas protegidas se obtiene un access token con `/auth/login` y se usa **Authorize**. `BackendTest.httpPublicoSwaggerYPermisos` verifica que UI y especificación responden y que un endpoint administrativo figura en el contrato. [**IE3.2.1**]

## 5. CORS, JWT, sesiones y restricciones

`SeguridadConfig` admite origen `http://localhost:5173` sobre `/api/**`, métodos GET, POST, PUT, DELETE, PATCH y OPTIONS y encabezados `Content-Type` y `Authorization`. El servidor escucha en `127.0.0.1:8080`. El backend no usa HTTP Basic: valida Bearer JWT en Spring Security con política HTTP sin estado. Las rutas `/admin/**` exigen `ADMINISTRADOR`; las demás operaciones comprueban rol y propiedad en los servicios (`ActorActual`, `PedidosService`, `ProductosService`, `InventarioService`). El registro público asigna exclusivamente `CLIENTE`. [**IE3.3.1, IE3.3.3**]

`JwtConfig` exige `JWT_SECRET` de al menos 32 bytes y configura HS256, emisor y validación de vencimiento. El access JWT dura 15 minutos. `AuthService.login` comprueba BCrypt; `AuthService.renovar` busca el hash del refresh token, elimina el anterior y emite uno nuevo; el refresh vence a los siete días. `logout` revoca el refresh presentado. Un access ya emitido puede seguir válido hasta su vencimiento. El JWT se contrasta además con usuario activo y rol vigente en H2. [**IE3.3.1**]

En React, `usuariosServicio` guarda ambos tokens en `localStorage`. `SesionContext` consulta `/auth/me` después de recargar y `RutaProtegida` muestra «Validando sesión...» antes de permitir una interfaz privada. Si el access venció, Axios intenta renovarlo; si el refresh también falla, se limpia la sesión y se vuelve al inicio de sesión. El carrito de la pestaña permanece en `sessionStorage`. `App.jsx` restringe `/mis-pedidos` al cliente, `/operador` al operador y `/admin` al administrador; `/pedido` admite visitantes para preparar el carrito, pero confirmar exige sesión de cliente. El control de React es de interfaz; la autorización efectiva reside en el backend. [**IE3.3.2, IE3.3.3**]

## 6. Flujo completo de pedido e inventario

1. `GET /productos` devuelve productos activos. El carrito conserva identificadores y cantidades; al abrir `/pedido`, sincroniza nombres y precios con el catálogo vigente. Advierte cambios y bloquea la confirmación de productos no disponibles.
2. El cliente envía destinatario, teléfono, dirección y líneas `{productoId, cantidad, precioEsperado}`. No envía una identidad de usuario como autoridad. Antes del envío se comprueba de nuevo el catálogo; el backend vuelve a validar precio, productos activos, unidades y stock dentro de la transacción.
3. `PedidosService.crear` obtiene el usuario del JWT, limita a cuatro unidades, rechaza duplicados y bloquea producto/inventario antes de calcular reservas. Un conflicto de precio o stock devuelve 409 y no guarda un pedido parcial. Al crear, el pedido queda `PENDIENTE` y compromete stock sin descontar el físico.
4. El cliente ve sus pedidos en `/mis-pedidos`. Cliente propietario u operador pueden cancelar un pedido o detalle solo mientras está pendiente; cancelar el último detalle activo cambia el pedido a `CANCELADO`.
5. El operador avanza `PENDIENTE → EN_CAMINO → ENTREGADO`. En la entrega se descuenta una vez el stock físico. `InventarioService` calcula `disponible = stock físico - comprometido`, donde comprometido suma detalles activos de pedidos pendientes o en camino.
6. Administración consulta pedidos, indicadores e inventario y gestiona el catálogo. Cambiar el precio o desactivar un producto no altera el nombre y precio históricos de pedidos existentes. [**IE3.1.1, IE3.2.2**]

## 7. Instalación y ejecución local

Requisitos: JDK 21, Node.js compatible con Vite 8 (se ha usado Node 24), npm, Python para la prueba adicional y conexión a Maven Central en el primer uso del wrapper. Iniciar desde `backend/` para mantener estable la ubicación de H2:

```powershell
$env:JAVA_HOME='C:/ruta/a/jdk-21'
$env:JWT_SECRET='secreto-aleatorio-de-al-menos-32-bytes'
$env:BOOTSTRAP_ADMIN_PASSWORD='clave-local-administrador'
$env:BOOTSTRAP_OPERADOR_PASSWORD='clave-local-operador'
./mvnw.cmd verify
./mvnw.cmd spring-boot:run
```

En otra terminal, desde la raíz:

```powershell
npm ci
npm run dev
```

El frontend abre en `http://localhost:5173`. `VITE_API_URL` permite cambiar la base de Axios. `DB_URL`, `DB_USER` y `DB_PASSWORD` permiten cambiar H2; por defecto se usa `backend/data/elvolcan.mv.db` cuando el directorio de trabajo es `backend/`. No iniciar dos procesos sobre el mismo archivo. Los secretos son ejemplos de formato, no valores de entrega. [**IE3.1.1, IE3.2.2, IE3.3.1**]

## 8. Pruebas y resultados comprobados

| Prueba | Comando o archivo | Resultado observado |
| --- | --- | --- |
| Frontend unitario y de componentes | `npm test` | 59 aprobadas, 2 omitidas (las de API real condicionadas por `RUN_REAL_API`). |
| Compilación frontend | `npm run build` | Correcta. |
| Backend con H2 de prueba | `./mvnw.cmd verify` | `BUILD SUCCESS`; 12 aprobadas, 0 fallos, 0 errores, 0 omitidas según Surefire. |
| Persistencia con servidor real y JWT | `python verificar_persistencia.py` | Correcta: JAR, HTTP, Swagger y H2 en archivo tras dos arranques; la semilla no sobrescribió el cambio. Usa un directorio temporal. |

Las pruebas `BackendTest` cubren CRUD, historial, reservas, cancelaciones, entrega única, concurrencia, validación HTTP, propiedad, roles, login, rotación y vencimiento de JWT y Swagger. Las pruebas frontend incluyen adaptadores de API, navegación por rol, sesión, carrito, precio cambiado y producto desactivado. Las dos pruebas React marcadas con `RUN_REAL_API` existen pero **no se ejecutaron en la suite habitual**; no se presentan como aprobadas. Para reproducirlas se requiere servidor activo y preparar el entorno de prueba según los archivos `PaginaPedido.integracion.test.jsx` y `Gestion.integracion.test.jsx`, evitando la base habitual. [**IE3.1.1, IE3.2.1, IE3.2.2, IE3.3.1, IE3.3.2, IE3.3.3**]

## 9. Limitaciones y alcance

- H2 en archivo y `ddl-auto=update` sirven para evaluación local; un despliegue real necesita migraciones versionadas, HTTPS y un secreto JWT propio.
- Guardar tokens en `localStorage` exige prevenir scripts maliciosos en el origen. Cerrar sesión revoca el refresh, pero no invalida instantáneamente un access ya emitido.
- No hay pago, reposición/ajuste de stock, paginación ni clave de idempotencia para crear pedidos. Un reintento después de perder la respuesta podría crear otro pedido si queda stock.
- Los cuatro productos iniciales son datos de demostración. No se generan clientes ni pedidos ficticios. Los datos antiguos del navegador no se importan ni se borran porque su propiedad no se puede atribuir con seguridad a usuarios H2.
- El video de Inicio es un marcador. Las capturas del manual deben tomarse de la aplicación real antes de la entrega.

## 10. Correspondencia con la rúbrica oficial EP3

| Indicador | Parte de este documento que aporta evidencia |
| --- | --- |
| **IE3.1.1** Backend, base, modelo y lógica | §§ 1, 2, 6, 7 y 8. |
| **IE3.2.1** API REST, CRUD y Swagger | §§ 3, 4 y 8. |
| **IE3.2.2** Integración backend/frontend | §§ 1, 3, 6 y 8. |
| **IE3.3.1** JWT y roles en backend | §§ 4, 5, 7 y 8. |
| **IE3.3.2** Persistencia de sesión en frontend | §§ 5 y 8. |
| **IE3.3.3** Restricciones de frontend | §§ 4, 5 y 8. |

La rúbrica asigna **IE3.1.2, IE3.2.3, IE3.2.4, IE3.3.4, IE3.3.5 e IE3.3.6** a la presentación individual. Este documento sirve de base para explicarlos, pero la exposición debe demostrar cada indicador. La entrega grupal exige además repositorios públicos separados, comprimidos y manual con capturas; este documento no sustituye esos entregables.
