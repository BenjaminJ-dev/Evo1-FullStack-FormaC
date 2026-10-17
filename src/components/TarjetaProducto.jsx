// src/components/TarjetaProducto.jsx
// Tarjeta de un cilindro en el catálogo. Recibe el producto y qué hacer
// al presionar "Comprar" por props.
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import imagenCilindro from '../assets/cilindro-gas.svg';
import { formatearPesos } from '../constantes';

export default function TarjetaProducto({ producto, onComprar }) {
  return (
    <Card as="article" className="h-100 shadow-sm text-center">
      <Card.Img
        variant="top"
        src={imagenCilindro}
        alt={`Cilindro de gas ${producto.nombre}`}
        className="p-3 imagen-producto"
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="h5">{producto.nombre}</Card.Title>
        <Card.Text>{producto.descripcion}</Card.Text>
        <Card.Text><strong>Precio: {formatearPesos(producto.precio)}</strong></Card.Text>
        <Button variant="primary" className="mt-auto" onClick={() => onComprar(producto.id)}>
          Comprar
        </Button>
      </Card.Body>
    </Card>
  );
}
