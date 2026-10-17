// src/components/TablaInventario.jsx
// Inventario en 3 columnas. Siempre se cumple:
//   Total = Pendiente a enviar + Disponible a enviar
// Recibe el resumen ya calculado por props (ver pedidosServicio.js).
import Table from 'react-bootstrap/Table';
import { formatearPesos } from '../constantes';

export default function TablaInventario({ resumen }) {
  return (
    <Table responsive className="align-middle">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Total (bodega)</th>
          <th>Pendiente a enviar</th>
          <th>Disponible a enviar</th>
        </tr>
      </thead>
      <tbody>
        {resumen.map((producto) => (
          <tr key={producto.id}>
            <td>{producto.nombre}</td>
            <td>{formatearPesos(producto.precio)}</td>
            <td>{producto.total}</td>
            <td>{producto.pendiente}</td>
            <td>{producto.disponible}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
