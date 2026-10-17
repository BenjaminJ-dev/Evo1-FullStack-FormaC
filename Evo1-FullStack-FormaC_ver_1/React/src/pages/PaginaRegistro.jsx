// src/pages/PaginaRegistro.jsx  (ruta: /registro)
import { Link, Navigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormularioRegistro from '../components/FormularioRegistro';
import { useSesion } from '../context/SesionContext';
import { rutaInicioPorRol } from '../services/usuariosServicio';

export default function PaginaRegistro() {
  const { sesion } = useSesion();

  if (sesion) {
    return <Navigate to={rutaInicioPorRol(sesion.rol)} replace />;
  }

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={5}>
        <section className="bg-white p-4 rounded border">
          <h2>Crear cuenta de cliente</h2>
          <p>Regístrate para poder iniciar sesión y realizar tus pedidos</p>
          <FormularioRegistro />
          <p className="mt-3 mb-0">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </section>
      </Col>
    </Row>
  );
}
