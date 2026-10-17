// src/components/BannerMensaje.jsx
// Aviso fijo arriba de toda la página: rojo para error, verde para éxito.
// Se cierra solo (ver MensajeContext) o con la "X".
import Alert from 'react-bootstrap/Alert';
import { useMensaje } from '../context/MensajeContext';

export default function BannerMensaje() {
  const { mensaje, cerrarMensaje } = useMensaje();

  if (!mensaje) return null;

  return (
    <Alert
      variant={mensaje.tipo === 'exito' ? 'success' : 'danger'}
      dismissible
      onClose={cerrarMensaje}
      className="banner-mensaje rounded-0 m-0"
    >
      {mensaje.texto}
    </Alert>
  );
}
