// src/pages/PaginaLogin.jsx  (ruta: /login)
// Punto de entrada del sitio: solo dos opciones, ingresar o ir a registrarse.
import { Link, Navigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormularioLogin from '../components/FormularioLogin';
import { useSesion } from '../context/SesionContext';
import { rutaInicioPorRol } from '../services/usuariosServicio';

export default function PaginaLogin() {
  const { sesion } = useSesion();

  // Si ya hay sesión (o recién se inició), se envía a la página de su rol
  if (sesion) {
    return <Navigate to={rutaInicioPorRol(sesion.rol)} replace />;
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={5}>
        <section className="bg-white p-4 rounded border">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
          <FormularioLogin />
          <p className="mt-3 mb-0">
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </section>
      </Col>
    </Row>
  );
}
