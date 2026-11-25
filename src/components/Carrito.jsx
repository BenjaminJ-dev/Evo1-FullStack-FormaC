import { obtenerProductoCompra } from '../services/productosServicio';
// src/components/Carrito.jsx
// Muestra los ítems del carrito, permite editar su cantidad o quitarlos, y
// confirmar el pedido. Es un componente "tonto": no guarda estado propio,
// todo lo recibe por props y avisa a la página con funciones.
//
// Props: items, total, cantidadTotal, maximo, onEditar, onQuitar, onConfirmar
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { formatearPesos } from '../constantes';

export default function Carrito({ items, total, cantidadTotal, maximo, onEditar, onQuitar, onConfirmar, procesando = false, productosDisponibles = null }) {
  const hayNoDisponibles = productosDisponibles?.length >= 0 && items.some(item => !productosDisponibles.some(p => p.id === item.cilindro));
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
              const vigente = productosDisponibles?.find(p => p.id === item.cilindro);
              const producto = productosDisponibles ? (vigente ?? { nombre: `Producto ${item.cilindro} no disponible` }) : (obtenerProductoCompra(item.cilindro) ?? { nombre: item.nombre ?? item.cilindro });
              return (
                <tr key={item.cilindro}>
                  <td>
                    {producto.nombre}
                    <div className="text-muted small">{vigente || !productosDisponibles ? `${formatearPesos(item.precioUnitario)} c/u` : 'Sin precio vigente'}</div>
                  </td>
                  <td className="text-nowrap">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      aria-label={`Quitar una unidad de ${producto.nombre}`}
                      disabled={procesando || item.cantidad <= 1}
                      onClick={() => onEditar(item.cilindro, item.cantidad - 1)}
                    >
                      −
                    </Button>
                    <span className="mx-2">{item.cantidad}</span>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      aria-label={`Agregar una unidad de ${producto.nombre}`}
                      disabled={procesando}
                      onClick={() => onEditar(item.cilindro, item.cantidad + 1)}
                    >
                      +
                    </Button>
                  </td>
                  <td>{vigente || !productosDisponibles ? formatearPesos(item.cantidad * item.precioUnitario) : '—'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label={`Quitar ${producto.nombre} del carrito`}
                      disabled={procesando}
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
              <th colSpan={2}>{hayNoDisponibles ? 'Pendiente de revisión' : formatearPesos(total)}</th>
            </tr>
          </tfoot>
        </Table>
      )}

      <Button
        variant="primary"
        className="w-100"
        disabled={items.length === 0 || procesando || hayNoDisponibles}
        onClick={onConfirmar}
      >
        {procesando ? 'Enviando pedido...' : 'Confirmar pedido'}
      </Button>
    </section>
  );
}
