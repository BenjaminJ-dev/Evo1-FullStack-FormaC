// src/pages/PaginaAdmin.jsx  (ruta: /admin, solo administrador)
// Panel con apartados SIN funcionalidad por ahora (solo el esqueleto visual).
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import PlaceholderAdmin from '../components/PlaceholderAdmin';

// Datos de EJEMPLO, estáticos: no están conectados al inventario real.
const EJEMPLO_PRODUCTOS = [
  { nombre: 'Cilindro GLP 5KG', precio: '$6.000', stock: 25, bajo: false },
  { nombre: 'Cilindro GLP 11KG', precio: '$11.000', stock: 30, bajo: false },
  { nombre: 'Cilindro GLP 15KG', precio: '$14.500', stock: 20, bajo: false },
  { nombre: 'Cilindro GLP 45KG', precio: '$40.000', stock: 8, bajo: true },
];

export default function PaginaAdmin() {
  return (
    <>
      <section className="bg-white p-4 rounded border mb-4">
        <h2>Panel de administración</h2>
        <p className="mb-0">Desde aquí la administradora podrá supervisar el sistema completo.</p>
      </section>

      {/* TODO (entrega futura): crear, editar y desactivar clientes y operadores,
          conectado a un backend real con su base de datos y control de roles. */}
      <PlaceholderAdmin
        titulo="Gestión de usuarios"
        descripcion="Este apartado permitirá crear, editar y desactivar cuentas de clientes y operadores."
      >
        <Button variant="primary" disabled>Crear usuario (próximamente)</Button>
      </PlaceholderAdmin>

      {/* TODO (entrega futura): conectar con el inventario real, editar precios e
          ingresar/egresar stock físico, todo validado y guardado en el backend. */}
      <PlaceholderAdmin
        titulo="Precios e inventario"
        descripcion="Este apartado permitirá editar precios y registrar el ingreso o egreso de stock (por ejemplo, cuando llega un camión con cilindros nuevos). Los datos de la tabla son solo un ejemplo visual."
      >
        <Table responsive className="align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {EJEMPLO_PRODUCTOS.map((producto) => (
              <tr key={producto.nombre}>
                <td>{producto.nombre}</td>
                <td>{producto.precio}</td>
                <td>
                  {producto.stock}{' '}
                  {producto.bajo && <Badge bg="warning" text="dark">Stock bajo</Badge>}
                </td>
                <td className="text-nowrap">
                  <Button size="sm" variant="primary" disabled className="me-1">Editar precio</Button>
                  <Button size="sm" variant="primary" disabled className="me-1">Ingresar stock</Button>
                  <Button size="sm" variant="primary" disabled>Egresar stock</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="small fst-italic mb-0">
          La etiqueta &quot;Stock bajo&quot; es solo un ejemplo de la alerta que aparecerá cuando el
          stock caiga bajo el 20% del total.
        </p>
      </PlaceholderAdmin>

      <PlaceholderAdmin
        titulo="Reportes"
        descripcion="Aquí se mostrarán reportes generales de pedidos, stock y ventas."
      />
    </>
  );
}
