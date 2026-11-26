# Distribuidora de Gas El Volcán — EP3 DSY1104

Aplicación académica de FullStack II. React 19 y Axios consumen la API REST de Spring Boot 4.1; el backend aplica las reglas de negocio y persiste usuarios, productos, inventario, pedidos y renovaciones JWT en H2. La interfaz usa Bootstrap y las pruebas frontend usan Vitest.

## Requisitos previos

- Windows 10/11 con PowerShell.
- Node.js 24 (probado con v24.22.0) y npm (probado con 11.19.1).
- JDK 21 (probado con Temurin 21.0.13) y la variable `JAVA_HOME` apuntando a él.
- Conexión a internet: el primer arranque descarga dependencias de Maven Central y npm.
- Puertos `8080` (backend) y `5173` (frontend) libres.
- Navegador web actualizado.

Verifica las versiones en PowerShell:

```powershell
node -v
npm -v
java -version
$env:JAVA_HOME
```

Resultado esperado: `node` muestra v24.x, `java` muestra 21.x y `$env:JAVA_HOME` muestra la ruta del JDK. Si `$env:JAVA_HOME` sale vacío, defínelo con `$env:JAVA_HOME='C:/ruta/a/jdk-21'`.

Verifica que los puertos estén libres (sin salida significa libres):

```powershell
netstat -ano | findstr ":8080 :5173"
```

## Ejecución paso a paso

Se usan **dos terminales de PowerShell**: una para el backend y otra para el frontend. Ambas deben quedar abiertas mientras se usa la aplicación.

### Paso 1. Backend (terminal 1)

Desde la raíz del proyecto entra a `backend/` y define las variables de entorno. Valen solo para esa ventana de PowerShell; si la cierras, hay que definirlas de nuevo.

```powershell
cd backend
$env:JWT_SECRET = -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
$env:BOOTSTRAP_ADMIN_PASSWORD = 'Admin-Demo-2026!'
$env:BOOTSTRAP_OPERADOR_PASSWORD = 'Operador-Demo-2026!'
```

Verifica que quedaron definidas:

```powershell
$env:JWT_SECRET.Length
$env:BOOTSTRAP_ADMIN_PASSWORD
```

Resultado esperado: el largo del secreto es `48` (el mínimo exigido es 32) y se muestra la clave del administrador.

Arranca el servidor (siempre desde `backend/`, para que la ruta relativa de H2 sea estable):

```powershell
./mvnw.cmd spring-boot:run
```

- La primera vez descarga Maven y dependencias; puede tardar varios minutos.
- La terminal queda ocupada: es normal.
- Resultado esperado: aparece una línea `Started ElVolcanApplication in N seconds`.

Comprueba que responde, desde **otra** terminal:

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8080/api/v1/productos
```

Resultado esperado: `200`.

### Paso 2. Frontend (terminal 2)

Desde la **raíz** del proyecto (donde está `package.json`):

```powershell
npm ci
npm run dev
```

- `npm ci` instala las versiones exactas de `package-lock.json` (177 paquetes aprox.).
- Es normal que npm informe una vulnerabilidad de severidad alta. No ejecutes `npm audit fix`: modificaría `package-lock.json`.
- Resultado esperado: Vite muestra `Local: http://localhost:5173/`.

Frontend: `http://localhost:5173`. API: `http://localhost:8080/api/v1`. `VITE_API_URL` permite cambiar la URL de Axios; el valor predeterminado es `http://localhost:8080/api/v1` (véase `.env.example`). CORS permite `http://localhost:5173`.

## Accesos y credenciales de demostración

Las claves siguientes son **solo de demostración** y se documentan para facilitar la revisión académica. No las uses en ningún entorno real.

| Rol | Usuario | Clave | Al iniciar sesión redirige a |
| --- | --- | --- | --- |
| Administrador | `admin` | `Admin-Demo-2026!` | `/admin` |
| Operador | `operador` | `Operador-Demo-2026!` | `/operador` |
| Cliente | el que registres en `/registro` | la que elijas | `/` |

Cómo probar cada rol (desde `http://localhost:5173/login`):

1. **Administrador:** inicia sesión con `admin`. Resultado esperado: acceso al panel de administración (indicadores, usuarios, pedidos, inventario y productos).
2. **Operador:** inicia sesión con `operador`. Resultado esperado: acceso al panel de operador (pedidos e inventario).
3. **Cliente:** crea la cuenta en `/registro` y luego inicia sesión. Resultado esperado: acceso al catálogo, al carrito (`/pedido`) y a `/mis-pedidos`.

Reglas del registro: usuario de 4 o más caracteres con letras, números o guion bajo; clave de 6 a 72 caracteres.

Notas importantes:

- `admin` y `operador` se crean al arrancar **solo si aún no existen** en H2; no se sobrescriben sus claves. Si la base ya fue creada con otras claves, detén el backend (`Ctrl + C`), borra la carpeta `backend/data/`, define las variables y arranca de nuevo.
- El login pide **usuario** (no correo).
- No hay un cliente precargado; se crea desde `/registro`.

## Swagger (documentación de la API)

1. Abre `http://localhost:8080/swagger-ui/index.html`. Resultado esperado: carga la lista de endpoints. OpenAPI JSON: `http://localhost:8080/v3/api-docs`.
2. Abre `POST /api/v1/auth/login` → **Try it out** y envía:

```json
{ "usuario": "admin", "password": "Admin-Demo-2026!" }
```

3. Copia el valor de `accessToken` de la respuesta.
4. Pulsa **Authorize**, pega el token en **bearerAuth** y confirma.
5. Prueba una ruta protegida, por ejemplo `GET /api/v1/admin/usuarios`. Resultado esperado: código `200` con la lista de usuarios.

El access token dura 15 minutos; si expira, repite el login. El refresh dura siete días, se rota y se revoca al cerrar sesión.

## Consola H2 (opcional, solo revisión local)

La consola de H2 permite ver las tablas de la base. Está **apagada por defecto** por seguridad y se enciende con una variable de entorno, antes de arrancar el backend (terminal 1, desde `backend/`):

```powershell
$env:H2_CONSOLE = 'true'
./mvnw.cmd spring-boot:run
```

Resultado esperado: en el log aparece `H2 console available at '/h2-console'`.

Abre `http://localhost:8080/h2-console` y completa:

| Campo | Valor |
| --- | --- |
| Saved Settings | `Generic H2 (Embedded)` |
| Driver Class | `org.h2.Driver` |
| JDBC URL | `jdbc:h2:file:./data/elvolcan` |
| User Name | `sa` |
| Password | (vacío) |

Pulsa **Connect**. Resultado esperado: se abre la consola con las tablas de la base en el panel izquierdo.

Notas:

- Cambia el JDBC URL a mano: el valor que propone la pantalla (`jdbc:h2:~/test`) no apunta a esta base.
- La consola corre dentro del mismo proceso del backend, por lo que no choca con el bloqueo del archivo H2. No inicies un segundo proceso sobre `backend/data/`.
- El servidor escucha solo en `127.0.0.1`. No habilites la consola en un entorno compartido o de producción: da acceso total a la base con el usuario `sa` sin contraseña.
- Para apagarla, detén el backend, cierra la terminal (o ejecuta `Remove-Item Env:H2_CONSOLE`) y arranca de nuevo.

## Arquitectura y uso

`src/services/clienteApi.js` añade Bearer JWT a Axios. Si una petición devuelve 401, comparte un intento de renovación y reintenta; si falla, elimina la sesión local. `SesionContext` valida `/auth/me` al recargar antes de mostrar una ruta protegida. Los tokens se guardan en `localStorage` y el carrito temporal en `sessionStorage`. Spring mantiene HTTP sin estado y almacena solo hashes de los refresh tokens en H2.

El cliente consulta el catálogo, registra una cuenta, inicia sesión y agrega hasta cuatro cilindros. El carrito sincroniza precio y disponibilidad con `/productos` antes de confirmar. `POST /pedidos` obtiene la identidad del JWT y comprueba de nuevo cantidades, precio y stock en una transacción. `/mis-pedidos` muestra solo pedidos propios y permite cancelar mientras están pendientes. El operador consulta pedidos e inventario, cancela pendientes y avanza `PENDIENTE → EN_CAMINO → ENTREGADO`. El administrador consulta indicadores, usuarios, pedidos, inventario y productos, y crea, edita o desactiva productos. Estas pantallas utilizan la API como fuente de datos.

El inventario distingue stock físico, comprometido y disponible (`disponible = físico - comprometido`). Crear reserva; cancelar libera la reserva; entregar descuenta físico una vez. Nombre y precio quedan registrados en el detalle histórico. Desactivar un producto no borra pedidos anteriores.

## API y permisos

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

Las rutas de React ordenan la navegación; la API verifica roles y propiedad. Consulta [backend/README.md](backend/README.md) para el contrato y la configuración H2.

## Pruebas y límites

```powershell
npm test
npm run build
cd backend
./mvnw.cmd verify
python verificar_persistencia.py
```

La prueba Python requiere `JAVA_HOME` y el JAR generado; usa JWT y H2 temporales, reinicia el JAR y no toca `backend/data/`. Dos pruebas React contra una API real se omiten normalmente; requieren `RUN_REAL_API=1`, backend activo y preparación de cuentas/datos de prueba.

## Problemas comunes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| El backend falla al iniciar por `JWT_SECRET` | La variable no está definida en esa ventana | Redefine las variables del Paso 1 en la terminal 1 |
| `Port 8080 was already in use` | Hay otro backend corriendo | Detén el otro proceso con `Ctrl + C` o libera el puerto |
| El login responde "Usuario o contraseña incorrectos" | La base ya existía con otras claves | Borra `backend/data/` con el backend detenido y arranca de nuevo |
| El login responde "No se pudo conectar con el servidor" | El backend no está corriendo | Revisa la terminal 1 y el `curl` del Paso 1 |
| `/h2-console` da 404 | La consola está apagada | Define `H2_CONSOLE='true'` y reinicia el backend |
| H2 informa que el archivo está bloqueado | Hay dos procesos sobre `backend/data/` | Deja un solo backend corriendo |
| Las variables desaparecieron | Se cerró la terminal | Vuelve a definirlas; no persisten entre ventanas |
