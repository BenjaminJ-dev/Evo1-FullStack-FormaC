// src/pages/PaginaInicio.jsx  (ruta: /, solo clientes)
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import imagenCamion from '../assets/camion-gas.svg';

export default function PaginaInicio() {
  const navigate = useNavigate();

  return (
    <>
      <section className="bg-white p-4 rounded border mb-4 text-center">
        <h2>Gas el volcán</h2>
        <p>Distribuidora de gas a domicilio en Chillán y cercanías</p>
        <img
          src={imagenCamion}
          alt="Camión repartidor de Gas El Volcán"
          className="img-fluid mb-3 imagen-camion"
        />
        <div>
          <Button variant="primary" onClick={() => navigate('/pedido')}>
            Realizar pedido
          </Button>
        </div>
      </section>

      <section className="bg-white p-4 rounded border mb-4">
        <h2>¿Quiénes somos?</h2>
        <article>
          <h3 className="h5">Una empresa familiar</h3>
          <p className="mb-0">
            Distribuidora de Gas el Volcán es una empresa familiar creada en Chillán,
            fundada en el año 1998.
          </p>
        </article>
      </section>

      <section className="bg-white p-4 rounded border mb-4">
        <h2>Conócenos en video</h2>
        {/* TODO: reemplazar por el video institucional real de la empresa cuando esté grabado. */}
        <div className="ratio ratio-16x9">
          <iframe
            src="https://www.youtube.com/embed/ysz5S6PUM-U"
            title="Video institucional Gas El Volcán"
            allowFullScreen
          />
        </div>
      </section>
    </>
  );
}
