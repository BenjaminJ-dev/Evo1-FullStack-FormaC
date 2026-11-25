# Manual de usuario — Distribuidora de Gas El Volcán

**Evaluación Parcial N.º 3 · DSY1104 FullStack II**  
**Público:** clientes, operadores y administradores.  
**Estado de capturas:** pendientes de incorporar. Las indicaciones `[CAPTURA M...]` señalan imágenes reales que deben tomarse de una instancia local con datos de demostración. Ocultar contraseñas, tokens y datos personales antes de entregarlas.

## 1. Presentación y acceso

La plataforma permite consultar cilindros de gas, preparar pedidos, seguirlos y administrar su atención. En la barra superior aparecen **Inicio**, **Productos**, **Iniciar sesión** y **Registrarse** para visitantes. Al acceder como cliente se muestran también **Realizar pedido** y **Mis pedidos**. Operadores y administradores ingresan a sus paneles propios. La dirección local habitual es `http://localhost:5173`; el servidor debe estar activo para cargar catálogo y operaciones.

**[CAPTURA M01 — Inicio]** Abrir `/` sin sesión. Mostrar barra superior, título «Gas el volcán» y botón **Realizar pedido**. El video de esta pantalla es un marcador de la aplicación académica; evitar presentarlo como material institucional real.

## 2. Catálogo público

Seleccionar **Productos** en la barra. La pantalla **Nuestros productos** muestra los cilindros activos y su precio vigente. Pulsar **Comprar** en una tarjeta lleva a **Realizar pedido** con ese cilindro seleccionado. No se requiere cuenta para consultar el catálogo o preparar el carrito; sí se requiere una cuenta de cliente para confirmar la compra.

**[CAPTURA M02 — Nuestros productos]** Abrir `/productos` sin sesión, con el catálogo ya cargado. Mostrar al menos una tarjeta, precio y botón **Comprar**. No usar precios ficticios añadidos a la imagen.

## 3. Registro e inicio de sesión

Para crear una cuenta, seleccionar **Registrarse**. En **Crear cuenta de cliente**, completar **Nombre completo**, **Nombre de usuario**, **Contraseña** y **Confirmar contraseña**, y pulsar **Crear cuenta**. El nombre de usuario debe tener al menos cuatro caracteres válidos; la contraseña, al menos seis. El registro crea únicamente cuentas de cliente. Tras el mensaje de éxito, iniciar sesión.

En **Iniciar sesión**, escribir **Usuario** y **Contraseña** y pulsar **Ingresar**. Si se llegó desde el carrito, el sistema vuelve a la compra después del acceso como cliente. Las cuentas de operador y administrador son internas: no se crean desde el formulario público. Al recargar una página privada puede aparecer «Validando sesión...» mientras se comprueba la sesión con el servidor.

**[CAPTURA M03 — Registro]** Abrir `/registro` y mostrar los cuatro campos y **Crear cuenta**, sin contraseñas visibles.  
**[CAPTURA M04 — Inicio de sesión]** Abrir `/login` y mostrar **Usuario**, **Contraseña** e **Ingresar**; usar campos vacíos o datos de demostración ocultos.

## 4. Carrito y creación de pedidos

En **Realizar pedido**, esperar a que finalice «Cargando catálogo y carrito...». Completar **Datos de entrega**: **Nombre completo**, **Teléfono (9 dígitos, sin espacios)** y **Dirección**. En **¿Qué necesitas?**, elegir **Tipo de cilindro**, indicar **Cantidad** y pulsar **Agregar al carrito**. El límite es de cuatro cilindros por pedido, sumando todas las líneas.

En **Tu carrito** se ven cantidad, precio unitario, subtotal y total. Los botones **+** y **−** ajustan unidades; **Quitar** retira un producto. El carrito temporal se conserva en la pestaña durante una recarga. Si el catálogo cambió, la pantalla actualiza el precio y avisa para revisar el total. Un producto desactivado o no disponible se conserva identificado en el carrito para que el usuario pueda quitarlo, pero **Confirmar pedido** queda bloqueado hasta resolverlo.

Al pulsar **Confirmar pedido**, el sistema vuelve a comprobar catálogo, precio y stock en el servidor. Si todo resulta válido, muestra «Pedido registrado correctamente.» y vacía el carrito. Si no hay sesión, dirige a **Iniciar sesión** y conserva el carrito. Si ocurre un error, el carrito permanece para corregir o reintentar. La aplicación registra el pedido; no realiza cobros en línea.

**[CAPTURA M05 — Formulario y carrito]** Abrir `/pedido` con sesión de cliente y catálogo cargado; mostrar **Datos de entrega**, **¿Qué necesitas?**, **Agregar al carrito**, **Tu carrito** y **Confirmar pedido**, con datos de entrega de demostración.  
**[CAPTURA M06 — Cambio de catálogo]** En un entorno de prueba, cambiar el precio de un producto ya añadido o desactivarlo desde administración; volver a `/pedido` y capturar el aviso correspondiente y el total actualizado o la confirmación bloqueada. No alterar la base habitual solo para la captura.

## 5. Consulta y cancelación de pedidos

Como cliente, abrir **Mis pedidos**. La tabla muestra fecha, productos, total y estado. Pulsar **Ver detalle** para consultar destinatario, dirección, teléfono y líneas del pedido. Mientras el estado sea **Pendiente**, se puede pulsar **Cancelar ítem** junto a un cilindro o **Cancelar pedido** para el pedido completo; el navegador solicita confirmación. Una vez **En camino** o **Entregado**, esas cancelaciones no están disponibles. Un pedido sin líneas activas pasa a **Cancelado**.

**[CAPTURA M07 — Mis pedidos]** Abrir `/mis-pedidos` como cliente con un pedido de demostración pendiente; mostrar la fila y **Ver detalle**.  
**[CAPTURA M08 — Confirmación de cancelación]** Capturar el cuadro de confirmación de **Cancelar ítem** o **Cancelar pedido** con un pedido de demostración. No cancelar un pedido real para producir la imagen.

## 6. Operador

La cuenta de operador abre **Pedidos realizados**. Puede consultar los pedidos, sus datos de entrega y el **Inventario de productos**. En un pedido pendiente puede usar **Cancelar ítem** o **Cancelar pedido**. El botón **Marcar en camino** cambia un pedido pendiente a **En camino**; luego **Marcar entregado** lo lleva a **Entregado**. La pantalla de inventario muestra **Producto**, **Precio**, **Total (bodega)**, **Pendiente a enviar** y **Disponible a enviar**. El operador no dispone de la gestión administrativa de productos o usuarios.

**[CAPTURA M09 — Panel operador]** Abrir `/operador` con cuenta de demostración de operador y un pedido de demostración; mostrar **Pedidos realizados**, botón de avance e **Inventario de productos** con la columna **Precio**.

## 7. Administrador y productos

La cuenta administradora abre **Panel de administración**. Las secciones son **Dashboard**, **Productos**, **Pedidos**, **Inventario** y **Usuarios**. **Dashboard** muestra indicadores; **Pedidos** es de consulta; **Usuarios** muestra nombre, usuario y rol sin contraseñas. **Inventario** muestra stock y precio. El monto de pedidos entregados no representa pagos cobrados.

En **Productos**, pulsar **Crear producto** para abrir **Nuevo cilindro**. Completar **Identificador**, **Nombre**, **Descripción**, **Precio** y **Stock inicial**; pulsar **Guardar producto** y confirmar. Para cambiar nombre, descripción o precio, pulsar **Editar [ID]** y luego **Guardar producto**. El identificador no se cambia al editar. **Desactivar [ID]** solicita confirmación y retira el producto de futuras compras, sin borrar el historial. No hay en esta interfaz una función para reponer o ajustar stock físico después de la creación.

**[CAPTURA M10 — Panel administración]** Abrir `/admin`, sección **Dashboard**, con cuenta administradora de demostración; mostrar indicadores.  
**[CAPTURA M11 — Productos]** Abrir **Productos** y capturar la tabla con **Crear producto**, **Editar [ID]** y **Desactivar [ID]**.  
**[CAPTURA M12 — Inventario y usuarios]** Tomar dos imágenes: secciones **Inventario** y **Usuarios**, mostrando encabezados y datos de demostración sin información personal real.

## 8. Cierre de sesión

Pulsar **Cerrar sesión** en la barra superior. Se elimina la sesión local y se revoca el token de renovación. Si se desea volver a una pantalla protegida, iniciar sesión de nuevo. El carrito temporal de la pestaña no se borra por cerrar sesión.

**[CAPTURA M13 — Cierre]** Mostrar la barra con **Cerrar sesión** antes de pulsarlo y, si se incluye segunda imagen, la barra pública tras salir. No mostrar tokens.

## 9. Mensajes y soluciones habituales

| Mensaje o situación | Qué hacer |
| --- | --- |
| «No se pudo cargar el catálogo...» o «No se pudo conectar con el servidor» | Comprobar que el backend esté iniciado; recargar la página o pulsar **Reintentar** si aparece. |
| «Usuario o contraseña incorrectos.» | Revisar los datos y volver a pulsar **Ingresar**. |
| «Tu sesión expiró...» | Iniciar sesión otra vez; el carrito sigue intacto. |
| «Se actualizaron precios del carrito.» | Revisar el nuevo total antes de **Confirmar pedido**. |
| «Hay productos desactivados o no disponibles...» | Pulsar **Quitar** en esas líneas y volver a revisar el pedido. |
| Aviso de precio cambiado o stock insuficiente | Actualizar la vista, revisar productos/cantidades y confirmar nuevamente. El servidor decide el precio y el stock vigentes. |
| No se permite cancelar o avanzar | Comprobar el estado del pedido y el rol de la cuenta. Solo los pendientes admiten cancelación. |

**[CAPTURA M14 — Error recuperable]** Capturar un aviso real producido en un entorno de demostración, por ejemplo un catálogo temporalmente no disponible o un precio modificado. Registrar qué acción lo resolvió; no fabricar el mensaje en la imagen.

## Relación con la rúbrica EP3

Este manual aporta evidencia de uso para **IE3.2.2** (integración visible), **IE3.3.2** (sesión al recargar) y **IE3.3.3** (interfaces restringidas). Las capturas de operador y administrador sirven como apoyo para la explicación individual de **IE3.3.5** y **IE3.3.6**. La rúbrica exige el manual **con pantallazos detallados**: los marcadores anteriores deben reemplazarse por capturas reales antes de la entrega.
