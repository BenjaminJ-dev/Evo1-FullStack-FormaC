# Distribuidora de Gas El Volcán — EP3 DSY1104

Aplicación académica de FullStack II. React 19 y Axios consumen la API REST de Spring Boot 4.1; el backend aplica las reglas de negocio y persiste usuarios, productos, inventario, pedidos y renovaciones JWT en H2. La interfaz usa Bootstrap y las pruebas frontend usan Vitest.

## Requisitos y ejecución

Se requieren Node.js compatible con Vite 8 (probado con Node 24), npm, JDK 21 y acceso a Maven Central en el primer uso del Maven Wrapper. Desde `backend/` configura las variables y arranca el servidor:

```powershell
$env:JAVA_HOME='C:/ruta/a/jdk-21'
$env:JWT_SECRET='secreto-aleatorio-de-al-menos-32-bytes'
$env:BOOTSTRAP_ADMIN_PASSWORD='clave-local-administrador'
$env:BOOTSTRAP_OPERADOR_PASSWORD='clave-local-operador'
./mvnw.cmd spring-boot:run
```

No guardes secretos en Git. Las contraseñas internas crean `admin` y `operador` solo si aún no existen en H2. Desde la raíz, en otra terminal:

```powershell
npm ci
npm run dev
```

Frontend: `http://localhost:5173`. API: `http://127.0.0.1:8080/api/v1`. `VITE_API_URL` permite cambiar la URL de Axios; el valor predeterminado es `http://localhost:8080/api/v1` (véase `.env.example`). CORS permite `http://localhost:5173`.

## Arquitectura y uso

`src/services/clienteApi.js` añade Bearer JWT a Axios. Si una petición devuelve 401, comparte un intento de renovación y reintenta; si falla, elimina la sesión local. `SesionContext` valida `/auth/me` al recargar antes de mostrar una ruta protegida. Los tokens se guardan en `localStorage` y el carrito temporal en `sessionStorage`. Spring mantiene HTTP sin estado y almacena solo hashes de los refresh tokens en H2.

El cliente consulta el catálogo, registra una cuenta, inicia sesión y agrega hasta cuatro cilindros. El carrito sincroniza precio y disponibilidad con `/productos` antes de confirmar. `POST /pedidos` obtiene la identidad del JWT y comprueba de nuevo cantidades, precio y stock en una transacción. `/mis-pedidos` muestra solo pedidos propios y permite cancelar mientras están pendientes. El operador consulta pedidos e inventario, cancela pendientes y avanza `PENDIENTE → EN_CAMINO → ENTREGADO`. El administrador consulta indicadores, usuarios, pedidos, inventario y productos, y crea, edita o desactiva productos. Estas pantallas utilizan la API como fuente de datos.

El inventario distingue stock físico, comprometido y disponible (`disponible = físico - comprometido`). Crear reserva; cancelar libera la reserva; entregar descuenta físico una vez. Nombre y precio quedan registrados en el detalle histórico. Desactivar un producto no borra pedidos anteriores.

## API, permisos y Swagger

| Ruta bajo `/api/v1` | Acceso |
| --- | --- |
| `GET /productos`, `/productos/{id}`; `POST /auth/registro`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Público |
| `GET /auth/me` | Autenticado |
| `POST /pedidos`, `GET /mis-pedidos` | Cliente |
| `GET /pedidos`, `GET /inventario` | Operador o administrador |
| `GET /pedidos/{id}` | Propietario, operador o administrador |
| `PATCH /pedidos/{id}/estado` | Operador |
| `PATCH /pedidos/{id}/cancelacion` y cancelación de detalle | Propietario u operador |
| `GET /admin/usuarios`, `/admin/indicadores`, `/admin/productos`; `POST`, `PUT`, `DELETE /admin/productos` | Administrador |

Swagger UI: `http://localhost:8080/swagger-ui/index.html`. OpenAPI JSON: `http://localhost:8080/v3/api-docs`. Para llamar rutas protegidas, usa `/auth/login`, copia `accessToken` y pulsa **Authorize → bearerAuth**. El access dura 15 minutos; el refresh dura siete días, se rota y se revoca al cerrar sesión. Las rutas de React ordenan la navegación; la API verifica roles y propiedad. Consulta [backend/README.md](backend/README.md) para el contrato y la configuración H2.

## Pruebas y límites

```powershell
npm test
npm run build
cd backend
./mvnw.cmd verify
python verificar_persistencia.py
```

La prueba Python requiere `JAVA_HOME` y el JAR generado; usa JWT y H2 temporales, reinicia el JAR y no toca `backend/data/`. Dos pruebas React contra una API real se omiten normalmente; requieren `RUN_REAL_API=1`, backend activo y preparación de cuentas/datos de prueba.

Los cuatro productos iniciales son datos de demostración; no se crean pedidos ni clientes ficticios. Los datos de versiones antiguas del navegador no se importan ni se borran porque no se puede atribuir con seguridad su propiedad en H2. El video de inicio es un marcador. No hay cobro ni ajuste/reposición de stock. Para publicar el sistema se requieren HTTPS, una clave JWT propia, protección frente a scripts maliciosos y migraciones SQL versionadas en lugar de `ddl-auto=update`.
