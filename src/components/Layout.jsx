// src/components/Layout.jsx
// Estructura común de todas las páginas: banner de avisos, barra de
// navegación (según el rol), contenido y pie de página.
// Aquí se elige el TEMA de color: el diseño es el mismo para todos y solo
// cambian los colores (cliente: naranja, operador: grises, admin: azul marino).
import { Link, NavLink, Outlet } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import BannerMensaje from './BannerMensaje';
import { useSesion } from '../context/SesionContext';
import { rutaInicioPorRol } from '../services/usuariosServicio';
import { ROLES } from '../constantes';

function obtenerTema(rol) {
  if (rol === ROLES.OPERADOR) return { clase: 'tema-operador', sufijo: ' - Operador' };
  if (rol === ROLES.ADMIN) return { clase: 'tema-admin', sufijo: ' - Administración' };
  return { clase: 'tema-cliente', sufijo: '' };
}

export default function Layout() {
  const { sesion, cerrarSesion } = useSesion();
  const rol = sesion?.rol;
  const tema = obtenerTema(rol);

  return (
    <div className={`tema ${tema.clase} min-vh-100 d-flex flex-column`}>
      <BannerMensaje />

      <header>
        <Navbar expand="md" variant="dark" className="barra-tema">
          <Container>
            <Navbar.Brand as={Link} to={sesion ? rutaInicioPorRol(rol) : '/login'}>
              Distribuidora de gas El Volcán{tema.sufijo}
            </Navbar.Brand>

            {/* Sin sesión (login y registro) no se muestra ningún menú */}
            {sesion && <Navbar.Toggle aria-controls="menu-principal" />}
            {sesion && (
              <Navbar.Collapse id="menu-principal">
                {rol === ROLES.CLIENTE && (
                  <Nav className="me-auto">
                    <Nav.Link as={NavLink} to="/" end>Inicio</Nav.Link>
                    <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
                    <Nav.Link as={NavLink} to="/pedido">Realizar pedido</Nav.Link>
                    <Nav.Link as={NavLink} to="/mis-pedidos">Mis pedidos</Nav.Link>
                  </Nav>
                )}
                <Nav className="ms-auto align-items-md-center">
                  <Navbar.Text className="me-md-3">Hola, {sesion.nombre}</Navbar.Text>
                  <Button variant="outline-light" size="sm" onClick={cerrarSesion}>
                    Cerrar sesión
                  </Button>
                </Nav>
              </Navbar.Collapse>
            )}
          </Container>
        </Navbar>
      </header>

      <main className="container my-4 flex-grow-1">
        <Outlet />
      </main>

      <footer className="pie-tema text-center py-4">
        <p className="mb-1">Gas El Volcan - Chillan</p>
        <p className="mb-0">2026. Gas El Volcan</p>
      </footer>
    </div>
  );
}
