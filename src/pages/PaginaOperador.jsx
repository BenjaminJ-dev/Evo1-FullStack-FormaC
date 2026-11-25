import { useCallback, useEffect, useRef, useState } from 'react';
import TablaPedidos from '../components/TablaPedidos';
import TablaInventario from '../components/TablaInventario';
import { useMensaje } from '../context/MensajeContext';
import { obtenerPedidosGestionApi, avanzarPedidoApi, cancelarDetalleApi, cancelarPedidoApi } from '../services/pedidosApi';
import { obtenerInventarioApi } from '../services/inventarioApi';
import { obtenerCatalogoPublico } from '../services/productosServicio';
import { mensajeErrorApi } from '../services/mensajeErrorApi';
import { siguienteEstado } from '../services/pedidosServicio';

export default function PaginaOperador() {
  const { mostrarMensaje } = useMensaje();
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const bloqueo = useRef(false);
  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, stock, catalogo] = await Promise.all([obtenerPedidosGestionApi(), obtenerInventarioApi(), obtenerCatalogoPublico()]);
      setPedidos(lista); setResumen(stock.map(item => ({ ...item, precio: catalogo.find(p => p.id === item.id)?.precio }))); setError('');
    } catch (fallo) { setError(mensajeErrorApi(fallo)); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { recargar(); }, [recargar]);
  const ejecutar = async (accion, texto) => {
    if (bloqueo.current) return;
    bloqueo.current = true; setProcesando(true);
    try { await accion(); await recargar(); mostrarMensaje(texto, 'exito'); }
    catch (fallo) { mostrarMensaje(mensajeErrorApi(fallo), 'error'); }
    finally { bloqueo.current = false; setProcesando(false); }
  };
  const avanzar = id => {
    const pedido = pedidos.find(p => p.id === id);
    const destino = siguienteEstado(pedido?.estado);
    if (destino) ejecutar(() => avanzarPedidoApi(id, destino), `Pedido marcado como ${destino}.`);
  };
  return <>
    <section className="bg-white p-4 rounded border mb-4">
      <h2>Pedidos realizados</h2>
      <p>Revisa pedidos, avanza el estado y cancela mientras estén pendientes.</p>
      {cargando && <p role="status">Cargando pedidos e inventario...</p>}
      {error && <p role="alert">{error} <button type="button" onClick={recargar}>Reintentar</button></p>}
      {!cargando && !error && (pedidos.length ? <TablaPedidos pedidos={pedidos} modo="operador" procesando={procesando}
        onAvanzar={avanzar}
        onCancelarItem={(id, detalleId) => ejecutar(() => cancelarDetalleApi(id, detalleId), 'Cilindro cancelado.')}
        onCancelarPedido={id => ejecutar(() => cancelarPedidoApi(id), 'Pedido cancelado.')} /> : <p>Todavía no hay pedidos registrados.</p>)}
    </section>
    <section className="bg-white p-4 rounded border mb-4">
      <h2>Inventario de productos</h2>
      <p>Stock físico, comprometido y disponible según H2.</p>
      {!cargando && !error && (resumen.length ? <TablaInventario resumen={resumen} /> : <p>No hay inventario registrado.</p>)}
    </section>
  </>;
}
