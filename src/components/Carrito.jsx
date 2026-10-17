// src/components/Carrito.jsx
// Muestra los ítems del carrito, permite editar su cantidad o quitarlos, y
// confirmar el pedido. Es un componente "tonto": no guarda estado propio,
// todo lo recibe por props y avisa a la página con funciones.
//
// Props: items, total, cantidadTotal, maximo, onEditar, onQuitar, onConfirmar
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { formatearPesos, obtenerProducto } from '../constantes';

export default function Carrito({ items, total, cantidadTotal, maximo, onEditar, onQuitar, onConfirmar }) {
  return (
    <section className="bg-white p-4 rounded border">
      <h2 className="h4">Tu carrito</h2>
      <p className="text-muted">{cantidadTotal} de {maximo} cilindros</p>

      {items.length === 0 ? (
        <p>Tu carrito está vacío. Agrega un cilindro desde el formulario.</p>
      ) : (
        <Table responsive className="align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th><span className="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const producto = obtenerProducto(item.cilindro);
              return (
                <tr key={item.cilindro}>
                  <td>
                    {producto.nombre}
                    <div className="text-muted small">{formatearPesos(item.precioUnitario)} c/u</div>
                  </td>
                  <td className="text-nowrap">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      aria-label={`Quitar una unidad de ${producto.nombre}`}
                      disabled={item.cantidad <= 1}
                      onClick={() => onEditar(item.cilindro, item.cantidad - 1)}
                    >
                      −
                    </Button>
                    <span className="mx-2">{item.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      aria-label={`Agregar una unidad de ${producto.nombre}`}
                      onClick={() => onEditar(item.cilindro, item.cantidad + 1)}
                    >
                      +
                    </Button>
                  </td>
                  <td>{formatearPesos(item.cantidad * item.precioUnitario)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label={`Quitar ${producto.nombre} del carrito`}
                      onClick={() => onQuitar(item.cilindro)}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={2}>Total</th>
              <th colSpan={2}>{formatearPesos(total)}</th>
            </tr>
          </tfoot>
        </Table>
      )}

      <Button
        variant="primary"
        className="w-100"
        disabled={items.length === 0}
        onClick={onConfirmar}
      >
        Confirmar pedido
      </Button>
    </section>
  );
}
