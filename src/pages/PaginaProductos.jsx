// src/pages/PaginaProductos.jsx  (ruta: /productos, solo clientes)
import { useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TarjetaProducto from '../components/TarjetaProducto';
import { PRODUCTOS_BASE } from '../constantes';

export default function PaginaProductos() {
  const navigate = useNavigate();

  return (
    <>
      <section className="bg-white p-4 rounded border mb-4">
        <h2>Nuestros productos</h2>
        <p className="mb-0">Revisa nuestros productos disponibles</p>
      </section>

      <section className="bg-white p-4 rounded border mb-4">
        {/* xs=1: una columna en celular · md=2: dos en tablet · lg=4: cuatro en escritorio */}
        <Row xs={1} md={2} lg={4} className="g-4">
          {PRODUCTOS_BASE.map((producto) => (
            <Col key={producto.id}>
              <TarjetaProducto
                producto={producto}
                onComprar={(id) => navigate(`/pedido?cilindro=${id}`)}
              />
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
}
