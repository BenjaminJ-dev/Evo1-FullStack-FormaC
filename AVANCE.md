# Registro de avance — Distribuidora Gas El Volcán (React)

## ✅ Hecho

- Migración completa del sitio a React + Vite + react-bootstrap + react-router-dom (8 páginas).
- Capa `services/` con toda la lógica de negocio y los datos (localStorage), lista para cambiarse por una API.
- Estado global con Context: sesión y banner de avisos (error/éxito, cierre automático y con "X").
- Login, registro y protección de rutas por rol (`RutaProtegida`); usuarios admin/operador hardcodeados.
- Carrito en `/pedido`: agregar, editar, quitar; máximo 4 en total; subtotales y total; validación de stock al confirmar.
- Pedido único con varios ítems, precio del momento guardado, no modificable una vez enviado.
- Cancelación por ítem y por pedido completo (solo en "Pendiente", con confirmación), cliente y operador.
- Inventario en 3 columnas (Total / Pendiente / Disponible) calculado desde los pedidos.
- Panel de operador funcional; panel de administración como esqueleto (3 apartados).
- Diseño responsivo con la grilla y el Navbar de Bootstrap; un solo diseño con 3 temas de color.
- 14 pruebas unitarias con Vitest (mocks de `window.confirm`, router en memoria, almacenamiento limpio).
- Todo en español; constantes con nombre; claves de almacenamiento versionadas (`gasVolcan_v2_*`).

## ⏳ Pendiente

- [ ] Documento de Cobertura del Testing (con los resultados de `npm run coverage`).
- [ ] ERS (versión final).
- [ ] Confirmar con el profesor Vitest vs Jasmine/Karma.
- [ ] Reemplazar el video de Inicio por el real.
- [ ] Revisión visual en celular, tablet y escritorio (la grilla de Bootstrap está aplicada; falta verlo en pantalla).
- [ ] Commits por etapa en el repositorio (los maneja el estudiante).
- [ ] Presentación (Situación evaluativa 2).
- [ ] Opcional: subir la cobertura (hoy 47%) con pruebas de `usuariosServicio`, `FormularioRegistro` y `PaginaPedido`.

### A futuro (fuera de esta entrega)
- Gestión real de usuarios, precios/inventario y reportes en administración.
- Backend (Spring Boot), base de datos, autenticación segura con token (resuelve también la limitación de `sessionStorage` por pestaña).
- Mapa de seguimiento de entregas.
