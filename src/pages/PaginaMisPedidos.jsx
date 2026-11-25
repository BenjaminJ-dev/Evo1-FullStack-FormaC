import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TablaPedidos from '../components/TablaPedidos';
import { useMensaje } from '../context/MensajeContext';
import { obtenerMisPedidosApi, obtenerDetallePedidoApi, cancelarDetalleApi, cancelarPedidoApi, mensajeErrorPedido } from '../services/pedidosApi';
import { formatearPesos } from '../constantes';

export default function PaginaMisPedidos() {
  const { mostrarMensaje } = useMensaje();
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const recargar = useCallback(async () => {
    try { setError(''); setPedidos(await obtenerMisPedidosApi()); }
    catch (fallo) { setError(mensajeErrorPedido(fallo)); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { recargar(); }, [recargar]);

  const ejecutar = async (accion, texto) => {
    if (procesando) return;
    setProcesando(true);
    try { await accion(); mostrarMensaje(texto, 'exito'); setDetalle(null); await recargar(); }
    catch (fallo) { mostrarMensaje(mensajeErrorPedido(fallo), 'error'); }
    finally { setProcesando(false); }
  };
  const verDetalle = async id => {
    try { setDetalle(await obtenerDetallePedidoApi(id)); }
    catch (fallo) { mostrarMensaje(mensajeErrorPedido(fallo), 'error'); }
  };

  return <section className="bg-white p-4 rounded border">
    <h2>Mis pedidos</h2>
    <p>Aquí puedes ver el historial y cancelar pedidos o cilindros mientras estén pendientes.</p>
    {cargando && <p role="status">Cargando pedidos...</p>}
    {error && <p role="alert">{error} <button type="button" onClick={recargar}>Reintentar</button></p>}
    {!cargando && !error && pedidos.length === 0 && <p className="mb-0">Aún no has realizado pedidos. <Link to="/pedido">Realiza tu primer pedido aquí</Link>.</p>}
    {!cargando && !error && pedidos.length > 0 && <TablaPedidos pedidos={pedidos} modo="cliente" procesando={procesando}
      onVerDetalle={verDetalle}
      onCancelarItem={(id, detalleId) => ejecutar(() => cancelarDetalleApi(id, detalleId), 'Cilindro cancelado.')}
      onCancelarPedido={id => ejecutar(() => cancelarPedidoApi(id), 'Tu pedido fue cancelado.')} />}
    {detalle && <aside className="border rounded p-3 mt-3" aria-label="Detalle del pedido">
      <h3 className="h5">Pedido #{detalle.id}</h3>
      <p>Entrega: {detalle.nombre}, {detalle.direccion}. Teléfono: {detalle.telefono}.</p>
      <ul>{detalle.items.map(item => <li key={item.id}>{item.cantidad} × {item.nombre} — {formatearPesos(item.precioUnitario)} c/u{item.cancelado ? ' (cancelado)' : ''}</li>)}</ul>
    </aside>}
  </section>;
}
