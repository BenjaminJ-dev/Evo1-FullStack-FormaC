# Backend — Distribuidora de Gas El Volcán

API REST para EP3 DSY1104: Spring Boot 4.1.0, Java 21, Spring Security, JPA, H2 y springdoc OpenAPI. React y Axios, en la carpeta superior, consumen esta API.

## Requisitos y arranque

Ejecuta desde `backend/` para mantener estable la ruta relativa de H2. El primer uso del Maven Wrapper descarga Maven 3.9.16 y dependencias desde Maven Central.

```powershell
$env:JAVA_HOME='C:/ruta/a/jdk-21'
$env:JWT_SECRET='secreto-aleatorio-de-al-menos-32-bytes'
$env:BOOTSTRAP_ADMIN_PASSWORD='clave-local-administrador'
$env:BOOTSTRAP_OPERADOR_PASSWORD='clave-local-operador'
./mvnw.cmd verify
./mvnw.cmd spring-boot:run
```

`JWT_SECRET` es obligatorio y necesita al menos 32 bytes. Las variables `BOOTSTRAP_*` crean `admin` y `operador` solo si aún no existen; no sobrescriben sus claves. No publiques secretos ni la base. `DB_URL`, `DB_USER` y `DB_PASSWORD` son opcionales. La URL predeterminada es `jdbc:h2:file:./data/elvolcan;LOCK_TIMEOUT=10000;WRITE_DELAY=0`, usuario `sa`, contraseña vacía. El servidor escucha en `127.0.0.1:8080`; CORS permite `http://localhost:5173`. La consola H2 está deshabilitada. No inicies dos procesos sobre el mismo archivo H2.

## Modelo y negocio

`Usuario` tiene contraseña BCrypt y rol `CLIENTE`, `OPERADOR` o `ADMINISTRADOR`. `Producto` guarda precio, estado activo y versión; `Inventario` almacena stock físico. `Pedido` pertenece a un usuario y contiene `DetallePedido` con cantidad, nombre y precio históricos. `RefreshToken` guarda el hash SHA-256 y el vencimiento, no el valor en claro.

Un pedido admite hasta cuatro unidades, productos activos y sin duplicados. El backend obtiene el cliente del JWT, compara el precio esperado con el vigente y comprueba stock disponible. El disponible es físico menos unidades comprometidas por pedidos `PENDIENTE` o `EN_CAMINO`. Cancelar un pendiente libera reserva; entregar reduce el físico una sola vez. Transacciones y bloqueos evitan sobreventa concurrente. `DELETE` de producto es desactivación lógica para conservar el historial.

## Autenticación y endpoints

`POST /api/v1/auth/login` recibe `usuario` y `password` y entrega `accessToken`, `refreshToken`, `username`, `nombre` y `rol`. El access JWT HS256 dura 15 minutos y se verifica por firma, emisor, vencimiento, usuario activo y rol vigente. `POST /auth/refresh` rota el refresh de siete días; `POST /auth/logout` lo revoca. `POST /auth/registro` crea solo clientes. `GET /auth/me` requiere Bearer JWT. No se usa HTTP Basic ni sesión HTTP persistente. Un access ya emitido puede seguir válido hasta vencer tras logout.

| Ruta bajo `/api/v1` | Permiso |
| --- | --- |
| `GET /productos`, `/productos/{id}`; `POST /auth/registro`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Público |
| `GET /auth/me` | Autenticado |
| `POST /pedidos`, `GET /mis-pedidos` | Cliente |
| `GET /pedidos`, `GET /inventario` | Operador o administrador |
| `GET /pedidos/{id}` | Propietario, operador o administrador |
| `PATCH /pedidos/{id}/estado` | Operador |
| `PATCH /pedidos/{id}/cancelacion`, `/pedidos/{id}/detalles/{detalleId}/cancelacion` | Propietario u operador, solo pendiente |
| `GET /admin/usuarios`, `/admin/indicadores`, `/admin/productos` | Administrador |
| `POST /admin/productos`, `PUT /admin/productos/{id}`, `DELETE /admin/productos/{id}` | Administrador |

Los DTO no incluyen contraseñas ni hashes. Los errores usan estados HTTP y `ProblemDetail` (400, 401, 403, 404 y 409, según el caso).

## Swagger y pruebas

Swagger UI: `http://localhost:8080/swagger-ui/index.html`; OpenAPI JSON: `http://localhost:8080/v3/api-docs`. Obtén un access token con `/api/v1/auth/login` y úsalo en **Authorize → bearerAuth** para demostrar rutas protegidas. Una cuenta cliente, una de operador y una de administrador permiten mostrar permisos distintos.

`./mvnw.cmd verify` ejecuta `BackendTest` con H2 en memoria aislada: CRUD, semilla, historial, stock, concurrencia, permisos, JWT, renovación, expiración y Swagger. Después de generar el JAR, `python verificar_persistencia.py` lo inicia dos veces con H2 en archivo temporal y un secreto JWT generado para la prueba; comprueba persistencia tras reinicio sin tocar `data/`. El frontend se inicia desde la raíz con `npm ci`, `npm run dev`, `npm test` y `npm run build`.

Limitaciones: los cuatro productos iniciales son datos de demostración; no se generan clientes ni pedidos ficticios. No hay ajuste/reposición de stock, pagos, paginación ni idempotencia en creación de pedidos. Un reintento tras perder la respuesta podría crear un segundo pedido si queda stock. Para despliegue real se requieren HTTPS, secreto propio y migraciones versionadas en lugar de `ddl-auto=update`.


## Consultar la base de datos H2

La consola web de H2 está deshabilitada en la aplicación, por lo que se abre por separado con el jar de H2 que Maven ya descargó. Sirve para ver las tablas y ejecutar consultas.

1. Detén el backend con `Ctrl + C`. El archivo H2 solo admite un proceso a la vez.
2. Ubica el jar de H2:

   ```powershell
   Get-ChildItem "$env:USERPROFILE\.m2\repository\com\h2database\h2" -Recurse -Filter *.jar
   ```

3. Con `JAVA_HOME` apuntando al JDK 21, abre la consola (ajusta la versión del jar si es distinta):

   ```powershell
   & "$env:JAVA_HOME\bin\java.exe" -jar "$env:USERPROFILE\.m2\repository\com\h2database\h2\2.4.240\h2-2.4.240.jar"
   ```

4. En la pestaña que se abre en el navegador, completa:
   - **URL JDBC:** `jdbc:h2:file:<ruta del proyecto>/backend/data/elvolcan;IFEXISTS=TRUE` (usa `/` en la ruta; `IFEXISTS=TRUE` evita crear una base vacía si la ruta está mal)
   - **Usuario:** `sa`
   - **Contraseña:** vacía
5. Pulsa **Conectar**. Las tablas aparecen en el panel izquierdo; al hacer clic en una, H2 escribe el `SELECT`. Las contraseñas se ven como hash BCrypt.
6. Al terminar, cierra la consola con `Ctrl + C` en su terminal y vuelve a arrancar el backend.
