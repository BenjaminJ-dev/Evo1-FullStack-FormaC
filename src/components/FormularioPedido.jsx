// src/components/FormularioPedido.jsx
// Datos de entrega + selector de cilindro y cantidad. No crea el pedido:
// solo AGREGA ítems al carrito (la página decide qué hacer con cada dato).
//
// Props:
//   entrega          -> { nombre, telefono, direccion } (estado en la página)
//   onCambiarEntrega -> (campo, valor) => void
//   onAgregar        -> (cilindro, cantidad) => { ok } (agrega al carrito)
//   cilindroInicial  -> cilindro preseleccionado (viene de "Comprar")
//   maximo           -> máximo de cilindros por pedido
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { PRODUCTOS_BASE } from '../constantes';

export default function FormularioPedido({
  entrega,
  onCambiarEntrega,
  onAgregar,
  cilindroInicial = '',
  maximo,
}) {
  const [cilindro, setCilindro] = useState(cilindroInicial);
  const [cantidad, setCantidad] = useState('1');

  const agregar = (evento) => {
    evento.preventDefault();
    const resultado = onAgregar(cilindro, Number(cantidad));
    if (resultado?.ok) {
      // Se deja listo para agregar otro cilindro
      setCilindro('');
      setCantidad('1');
    }
  };

  return (
    <Form onSubmit={agregar} noValidate>
      <h3 className="h5">Datos de entrega</h3>
      <Form.Group className="mb-3" controlId="pedidoNombre">
        <Form.Label>Nombre completo</Form.Label>
        <Form.Control
          type="text"
          placeholder="Juan Alberto Pérez Muñoz"
          autoComplete="name"
          value={entrega.nombre}
          onChange={(e) => onCambiarEntrega('nombre', e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="pedidoTelefono">
        <Form.Label>Teléfono (9 dígitos, sin espacios)</Form.Label>
        <Form.Control
          type="tel"
          inputMode="numeric"
          maxLength={9}
          placeholder="912345678"
          autoComplete="tel"
          value={entrega.telefono}
          onChange={(e) => onCambiarEntrega('telefono', e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-4" controlId="pedidoDireccion">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          placeholder="Av. Principal 123"
          autoComplete="street-address"
          value={entrega.direccion}
          onChange={(e) => onCambiarEntrega('direccion', e.target.value)}
        />
      </Form.Group>

      <h3 className="h5">¿Qué necesitas?</h3>
      <Form.Group className="mb-3" controlId="pedidoCilindro">
        <Form.Label>Tipo de cilindro</Form.Label>
        <Form.Select value={cilindro} onChange={(e) => setCilindro(e.target.value)}>
          <option value="">Selecciona un cilindro</option>
          {PRODUCTOS_BASE.map((producto) => (
            <option key={producto.id} value={producto.id}>{producto.nombre}</option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3" controlId="pedidoCantidad">
        <Form.Label>Cantidad (máximo {maximo} cilindros por pedido)</Form.Label>
        <Form.Control
          type="number"
          min="1"
          max={maximo}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />
      </Form.Group>
      <Button type="submit" variant="outline-primary" className="w-100">
        Agregar al carrito
      </Button>
    </Form>
  );
}
