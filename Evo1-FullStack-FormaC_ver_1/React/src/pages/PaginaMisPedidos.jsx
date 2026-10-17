// src/pages/PaginaMisPedidos.jsx  (ruta: /mis-pedidos, solo clientes)
// Historial de pedidos del cliente. Puede cancelar mientras estén Pendiente.
import { Link } from 'react-router-dom';
import TablaPedidos from '../components/TablaPedidos';
import usePedidos from '../hooks/usePedidos';
import { useSesion } from '../context/SesionContext';
import { useMensaje } from '../context/MensajeContext';
import { cancelarItem, cancelarPedido } from '../services/pedidosServicio';

export default function PaginaMisPedidos() {
  const { sesion } = useSesion();
  const { mostrarMensaje } = useMensaje();
  const { pedidos, recargar } = usePedidos(sesion.usuario);

  const manejarResultado = (resultado, textoExito) => {
    if (resultado.ok) {
      mostrarMensaje(textoExito, 'exito');
      recargar();
    } else {
      mostrarMensaje('No se pudo cancelar: el pedido ya no está Pendiente.', 'error');
    }
  };

  return (
    <section className="bg-white p-4 rounded border">
      <h2>Mis pedidos</h2>
      <p>
        Aquí puedes ver el historial y el estado de tus pedidos.
        Puedes cancelar un pedido (o uno de sus cilindros) mientras esté &quot;Pendiente&quot;.
      </p>

      {pedidos.length === 0 ? (
        <p className="mb-0">
          Aún no has realizado pedidos. <Link to="/pedido">Realiza tu primer pedido aquí</Link>.
        </p>
      ) : (
        <TablaPedidos
          pedidos={pedidos}
          modo="cliente"
          onCancelarItem={(id, indice) => manejarResultado(cancelarItem(id, indice), 'Cilindro cancelado.')}
          onCancelarPedido={(id) => manejarResultado(cancelarPedido(id), 'Tu pedido fue cancelado.')}
        />
      )}
    </section>
  );
}
