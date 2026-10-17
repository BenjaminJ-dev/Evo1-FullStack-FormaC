// src/components/TablaPedidos.jsx
// Tabla de pedidos usada en DOS pantallas, según la prop "modo":
//   modo="cliente"  -> "Mis pedidos" (solo ve los suyos y puede cancelar)
//   modo="operador" -> panel del operador (además avanza el estado)
// Cada pedido es una fila; sus ítems van como lista dentro de la fila.
//
// Props: pedidos, modo, onAvanzar(id), onCancelarItem(id, indice), onCancelarPedido(id)
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { ESTADOS, formatearPesos, obtenerProducto } from '../constantes';
import { calcularTotalPedido, sePuedeCancelar, siguienteEstado } from '../services/pedidosServicio';

const COLOR_ESTADO = {
  [ESTADOS.PENDIENTE]: 'warning',
  [ESTADOS.EN_CAMINO]: 'info',
  [ESTADOS.ENTREGADO]: 'success',
  [ESTADOS.CANCELADO]: 'danger',
};

function EtiquetaEstado({ estado }) {
  return <Badge bg={COLOR_ESTADO[estado]} text={estado === ESTADOS.PENDIENTE || estado === ESTADOS.EN_CAMINO ? 'dark' : undefined}>{estado}</Badge>;
}

export default function TablaPedidos({
  pedidos,
  modo = 'cliente',
  onAvanzar,
  onCancelarItem,
  onCancelarPedido,
}) {
  const esOperador = modo === 'operador';

  // Toda cancelación pide confirmación antes de ejecutarse
  const confirmar = (texto, accion) => {
    if (window.confirm(texto)) {
      accion();
    }
  };

  return (
    <Table responsive hover className="align-middle">
      <thead>
        <tr>
          <th>Fecha</th>
          {esOperador && <th>Cliente</th>}
          {esOperador && <th>Dirección</th>}
          <th>Productos</th>
          <th>Total</th>
          <th>Estado</th>
          {esOperador && <th>Avanzar</th>}
          <th>Cancelar</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((pedido) => {
          const puedeCancelar = sePuedeCancelar(pedido);
          const siguiente = siguienteEstado(pedido.estado);

          return (
            <tr key={pedido.id}>
              <td>{pedido.fecha}</td>
              {esOperador && <td>{pedido.nombre}<div className="text-muted small">{pedido.telefono}</div></td>}
              {esOperador && <td>{pedido.direccion}</td>}
              <td>
                <ul className="list-unstyled mb-0">
                  {pedido.items.map((item, indice) => {
                    const nombre = obtenerProducto(item.cilindro)?.nombre ?? item.cilindro;
                    return (
                      <li key={item.cilindro} className="mb-1">
                        <span className={item.cancelado ? 'text-decoration-line-through text-muted' : ''}>
                          {item.cantidad}×{nombre}
                        </span>
                        {puedeCancelar && !item.cancelado && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="ms-2 py-0"
                            aria-label={`Cancelar ${nombre} del pedido`}
                            onClick={() =>
                              confirmar(`¿Seguro que quieres cancelar ${nombre}?`, () =>
                                onCancelarItem(pedido.id, indice),
                              )
                            }
                          >
                            Cancelar ítem
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td>{formatearPesos(calcularTotalPedido(pedido))}</td>
              <td><EtiquetaEstado estado={pedido.estado} /></td>
              {esOperador && (
                <td>
                  {siguiente ? (
                    <Button size="sm" variant="primary" onClick={() => onAvanzar(pedido.id)}>
                      Marcar {siguiente.toLowerCase()}
                    </Button>
                  ) : (
                    '—'
                  )}
                </td>
              )}
              <td>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={!puedeCancelar}
                  onClick={() =>
                    confirmar('¿Seguro que quieres cancelar el pedido completo?', () =>
                      onCancelarPedido(pedido.id),
                    )
                  }
                >
                  Cancelar pedido
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
