// src/pages/PaginaProductos.jsx  (ruta pública: /productos)
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TarjetaProducto from '../components/TarjetaProducto';
import { obtenerCatalogoPublico } from '../services/productosServicio';

export default function PaginaProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    obtenerCatalogoPublico()
      .then(datos => { if (vigente) setProductos(datos); })
      .catch(() => { if (vigente) setError('No se pudo cargar el catálogo. Comprueba que el servidor esté disponible e inténtalo de nuevo.'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);

  return (
    <>
      <section className="bg-white p-4 rounded border mb-4">
        <h2>Nuestros productos</h2>
        <p className="mb-0">Revisa nuestros productos disponibles</p>
      </section>

      <section className="bg-white p-4 rounded border mb-4">
        {/* xs=1: una columna en celular · md=2: dos en tablet · lg=4: cuatro en escritorio */}
        {cargando && <p role="status">Cargando productos...</p>}
        {error && <Alert variant="danger" role="alert">{error}</Alert>}
        {!cargando && !error && productos.length === 0 && <p>No hay productos disponibles.</p>}
        {!cargando && !error && <Row xs={1} md={2} lg={4} className="g-4">
          {productos.map((producto) => (
            <Col key={producto.id}>
              <TarjetaProducto
                producto={producto}
                onComprar={(id) => navigate(`/pedido?cilindro=${id}`)}
              />
            </Col>
          ))}
        </Row>}
      </section>
    </>
  );
}
