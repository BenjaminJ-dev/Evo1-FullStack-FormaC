import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Table, Form, Row, Col, Nav, Card, Badge } from 'react-bootstrap';
import TablaInventario from '../components/TablaInventario';
import TablaPedidos from '../components/TablaPedidos';
import { obtenerProductosAdminApi, guardarProductoApi, desactivarProductoApi, obtenerUsuariosApi, obtenerIndicadoresApi, adaptarIndicadores } from '../services/adminApi';
import { obtenerPedidosGestionApi } from '../services/pedidosApi';
import { obtenerInventarioApi } from '../services/inventarioApi';
import { mensajeErrorApi } from '../services/mensajeErrorApi';
import { useMensaje } from '../context/MensajeContext';
import { ROLES, formatearPesos } from '../constantes';

const nuevo = { id: '', nombre: '', descripcion: '', precio: '', stock: '0' };
export default function PaginaAdmin() {
  const [seccion, setSeccion] = useState('Dashboard');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [indicadores, setIndicadores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const bloqueo = useRef(false);
  const [formulario, setFormulario] = useState(null);
  const [editando, setEditando] = useState(null);
  const { mostrarMensaje } = useMensaje();
  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const [i, u, p, pedidosApi, stock] = await Promise.all([obtenerIndicadoresApi(), obtenerUsuariosApi(), obtenerProductosAdminApi(), obtenerPedidosGestionApi(), obtenerInventarioApi()]);
      setIndicadores(adaptarIndicadores(i)); setUsuarios(u); setProductos(p); setPedidos(pedidosApi);
      setInventario(stock.map(item => ({ ...item, precio: p.find(producto => producto.id === item.id)?.precio })));
      setError('');
    } catch (fallo) { setError(mensajeErrorApi(fallo)); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { recargar(); }, [recargar]);
  const ejecutar = async accion => {
    if (bloqueo.current) return;
    bloqueo.current = true; setProcesando(true);
    try { await accion(); await recargar(); setFormulario(null); mostrarMensaje('Operación realizada correctamente.', 'exito'); }
    catch (fallo) { mostrarMensaje(mensajeErrorApi(fallo), 'error'); }
    finally { bloqueo.current = false; setProcesando(false); }
  };
  const guardar = evento => {
    evento.preventDefault();
    if (!window.confirm('¿Guardar los cambios del producto?')) return;
    ejecutar(() => guardarProductoApi(formulario, editando));
  };
  return <>
    <section className="bg-white p-4 rounded border mb-4">
      <h2>Panel de administración</h2>
      <p>Supervisión del catálogo, pedidos e inventario.</p>
      <Nav variant="pills" className="gap-2 flex-wrap" aria-label="Secciones administrativas">
        {['Dashboard', 'Productos', 'Pedidos', 'Inventario', 'Usuarios'].map(nombre => <Nav.Item key={nombre}><Nav.Link as="button" active={seccion === nombre} onClick={() => setSeccion(nombre)}>{nombre}</Nav.Link></Nav.Item>)}
      </Nav>
    </section>
    <section className="bg-white p-4 rounded border">
      <h3>{seccion}</h3>
      {cargando && <p role="status">Cargando administración...</p>}
      {error && <p role="alert">{error} <button type="button" onClick={recargar}>Reintentar</button></p>}
      {!cargando && !error && seccion === 'Dashboard' && <><Row xs={1} md={2} lg={4} className="g-3">{Object.entries(indicadores).map(([nombre, valor]) => <Col key={nombre}><Card className="h-100"><Card.Body><Card.Title className="h6">{nombre}</Card.Title><p className="fs-3 mb-0">{nombre === 'Monto de pedidos entregados' ? formatearPesos(valor) : valor}</p></Card.Body></Card></Col>)}</Row><p className="text-muted mt-3">El monto entregado no representa pagos efectivamente cobrados.</p></>}
      {!cargando && !error && seccion === 'Productos' && <>
        <Button disabled={procesando} onClick={() => { setEditando(null); setFormulario({ ...nuevo }); }}>Crear producto</Button>
        {formulario && <Form onSubmit={guardar} className="border rounded p-3 my-3">
          <h4>{editando ? 'Editar producto' : 'Nuevo cilindro'}</h4>
          <Row>{[['id','Identificador'], ['nombre','Nombre'], ['descripcion','Descripción'], ['precio','Precio'], ...(!editando ? [['stock','Stock inicial']] : [])].map(([campo, etiqueta]) => <Col md={6} key={campo}><Form.Group className="mb-3" controlId={`producto-${campo}`}><Form.Label>{etiqueta}</Form.Label><Form.Control required disabled={campo === 'id' && !!editando} type={['precio','stock'].includes(campo) ? 'number' : 'text'} min={campo === 'precio' ? 1 : 0} step="1" value={formulario[campo]} onChange={e => setFormulario({ ...formulario, [campo]: e.target.value })} /></Form.Group></Col>)}</Row>
          <Button type="submit" disabled={procesando}>{procesando ? 'Guardando...' : 'Guardar producto'}</Button>{' '}<Button variant="secondary" disabled={procesando} onClick={() => setFormulario(null)}>Cancelar</Button>
        </Form>}
        <Table responsive className="mt-3"><thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{productos.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.nombre}</td><td>{formatearPesos(p.precio)}</td><td><Badge bg={p.activo ? 'success' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge></td><td><div className="d-flex gap-2 flex-wrap"><Button size="sm" disabled={procesando} onClick={() => { setEditando(p.id); setFormulario({ ...p }); }}>Editar {p.id}</Button><Button size="sm" variant="outline-danger" disabled={!p.activo || procesando} onClick={() => { if (window.confirm('¿Desactivar este producto para nuevas compras?')) ejecutar(() => desactivarProductoApi(p.id)); }}>Desactivar {p.id}</Button></div></td></tr>)}</tbody></Table>
        {!productos.length && <p>No hay productos registrados.</p>}
      </>}
      {!cargando && !error && seccion === 'Pedidos' && (pedidos.length ? <TablaPedidos pedidos={pedidos} modo="admin" /> : <p>No hay pedidos registrados.</p>)}
      {!cargando && !error && seccion === 'Inventario' && (inventario.length ? <TablaInventario resumen={inventario} /> : <p>No hay inventario registrado.</p>)}
      {!cargando && !error && seccion === 'Usuarios' && <><p>Consulta de cuentas registradas e internas.</p><Table responsive><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th></tr></thead><tbody>{usuarios.map(u => <tr key={u.usuario}><td>{u.nombre}</td><td>{u.usuario}</td><td>{u.rol}</td></tr>)}</tbody></Table>{!usuarios.some(u => u.rol === ROLES.CLIENTE) && <p>No hay clientes registrados.</p>}</>}
    </section>
  </>;
}
