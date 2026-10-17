// src/pages/PaginaOperador.jsx  (ruta: /operador, solo operador)
// Ve todos los pedidos, avanza su estado o los cancela, y revisa el inventario.
import TablaPedidos from '../components/TablaPedidos';
import TablaInventario from '../components/TablaInventario';
import usePedidos from '../hooks/usePedidos';
import useInventario from '../hooks/useInventario';
import { useMensaje } from '../context/MensajeContext';
import { avanzarEstado, cancelarItem, cancelarPedido } from '../services/pedidosServicio';

export default function PaginaOperador() {
  const { mostrarMensaje } = useMensaje();
  const { pedidos, recargar: recargarPedidos } = usePedidos();
  const { resumen, recargar: recargarInventario } = useInventario();

  // Tras cualquier acción se vuelven a leer pedidos e inventario,
  // así las 3 columnas se actualizan al instante.
  const refrescar = () => {
    recargarPedidos();
    recargarInventario();
  };

  const avanzar = (id) => {
    const resultado = avanzarEstado(id);
    if (resultado.ok) {
      mostrarMensaje(`Pedido de ${resultado.pedido.nombre} marcado como ${resultado.pedido.estado}.`, 'exito');
      refrescar();
    }
  };

  const cancelar = (resultado, textoExito) => {
    if (resultado.ok) {
      mostrarMensaje(textoExito, 'exito');
      refrescar();
    } else {
      mostrarMensaje('No se pudo cancelar: el pedido ya no está Pendiente.', 'error');
    }
  };

  return (
    <>
      <section className="bg-white p-4 rounded border mb-4">
        <h2>Pedidos realizados</h2>
        <p>
          Revisa los pedidos de los clientes, actualiza su estado de entrega o cancélalos
          (o cancela uno de sus cilindros) mientras estén &quot;Pendiente&quot;.
        </p>
        {pedidos.length === 0 ? (
          <p className="mb-0">Todavía no hay pedidos registrados.</p>
        ) : (
          <TablaPedidos
            pedidos={pedidos}
            modo="operador"
            onAvanzar={avanzar}
            onCancelarItem={(id, indice) => cancelar(cancelarItem(id, indice), 'Cilindro cancelado.')}
            onCancelarPedido={(id) => cancelar(cancelarPedido(id), 'Pedido cancelado.')}
          />
        )}
      </section>

      <section className="bg-white p-4 rounded border mb-4">
        <h2>Inventario de productos</h2>
        <p>
          Stock real, comprometido en pedidos pendientes y disponible para nuevos pedidos.
          Se cumple siempre: <strong>Total = Pendiente a enviar + Disponible a enviar</strong>.
        </p>
        <TablaInventario resumen={resumen} />
      </section>
    </>
  );
}
