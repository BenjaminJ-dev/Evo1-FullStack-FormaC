import { obtenerCatalogoPublico } from '../services/productosServicio';
// Pedido disponible para visitantes; confirmar requiere una sesion de cliente.
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormularioPedido from '../components/FormularioPedido';
import Carrito from '../components/Carrito';
import { useCarritoCompartido } from '../context/CarritoContext';
import { useSesion } from '../context/SesionContext';
import { useMensaje } from '../context/MensajeContext';
import { crearPedidoApi, mensajeErrorPedido } from '../services/pedidosApi';
import { validarTelefono } from '../services/validaciones';

export default function PaginaPedido() {
  const { sesion } = useSesion();
  const { mostrarMensaje } = useMensaje();
  const carrito = useCarritoCompartido();
  const navigate = useNavigate();
  const [procesando, setProcesando] = useState(false);
  const envioEnCurso = useRef(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [catalogoListo, setCatalogoListo] = useState(false);
  const [avisoCarrito, setAvisoCarrito] = useState('');
  const [errorCatalogo, setErrorCatalogo] = useState('');
  useEffect(() => {
    let vigente = true;
    obtenerCatalogoPublico().then(datos => { if (vigente) {
      const faltantes = carrito.items.filter(item => !datos.some(p => p.id === item.cilindro));
      const cambiados = carrito.items.filter(item => { const p = datos.find(p => p.id === item.cilindro); return p && p.precio !== item.precioUnitario; });
      if (faltantes.length || cambiados.length) setAvisoCarrito(`${cambiados.length ? 'Se actualizaron precios del carrito. ' : ''}${faltantes.length ? 'Hay productos desactivados o no disponibles; quítalos antes de confirmar.' : ''}`);
      carrito.actualizarPreciosDesdeCatalogo(datos);
      setProductosDisponibles(datos); setCatalogoListo(true);
    } })
      .catch(() => { if (vigente) setErrorCatalogo('No se pudo cargar el catálogo para el pedido. Inténtalo de nuevo más tarde.'); });
    return () => { vigente = false; };
  }, []);

  // Si se llega desde "Comprar" en productos, viene ?cilindro=5KG
  const [parametros] = useSearchParams();
  const cilindroInicial = parametros.get('cilindro') ?? '';

  // El nombre se prellena con el de la sesión; el resto lo escribe el cliente
  const [entrega, setEntrega] = useState({ nombre: sesion?.nombre ?? '', telefono: '', direccion: '' });
  useEffect(() => { if (sesion?.nombre) setEntrega(actual => actual.nombre ? actual : { ...actual, nombre: sesion.nombre }); }, [sesion?.nombre]);
  const cambiarEntrega = (campo, valor) =>
    setEntrega((actual) => ({ ...actual, [campo]: valor }));

  // Los errores del carrito (máximo, cantidad inválida...) se avisan en el banner
  const avisarSiHayError = (resultado) => {
    if (!resultado.ok) {
      mostrarMensaje(resultado.error, 'error');
    }
    return resultado;
  };

  const confirmar = async () => {
    if (envioEnCurso.current) return;
    if (!sesion) {
      navigate('/login', { state: { volverCompra: true } });
      return;
    }
    const nombre = entrega.nombre.trim();
    const direccion = entrega.direccion.trim();

    if (carrito.items.length === 0) {
      mostrarMensaje('Agrega al menos un cilindro al carrito.', 'error');
      return;
    }
    if (!catalogoListo || carrito.items.some(item => !productosDisponibles.some(p => p.id === item.cilindro))) {
      mostrarMensaje('Hay productos no disponibles o el catálogo no está listo. Revisa tu carrito.', 'error');
      return;
    }
    if (nombre === '') {
      mostrarMensaje('Debes ingresar tu nombre.', 'error');
      return;
    }
    if (entrega.telefono === '') {
      mostrarMensaje('Debes ingresar tu teléfono.', 'error');
      return;
    }
    if (!validarTelefono(entrega.telefono)) {
      mostrarMensaje('El teléfono debe tener 9 dígitos numéricos, sin espacios ni guiones (ej: 912345678).', 'error');
      return;
    }
    if (direccion === '') {
      mostrarMensaje('Debes ingresar tu dirección.', 'error');
      return;
    }

    // El backend decide stock y precio en una transacción; el carrito permanece si falla.
    envioEnCurso.current = true;
    setProcesando(true);
    try {
      const vigentes = await obtenerCatalogoPublico();
      if (carrito.items.some(item => !vigentes.some(p => p.id === item.cilindro))) throw new Error('Hay productos que ya no están disponibles. Ajusta tu carrito.');
      if (carrito.items.some(item => vigentes.find(p => p.id === item.cilindro).precio !== item.precioUnitario)) {
        carrito.actualizarPreciosDesdeCatalogo(vigentes);
        throw new Error('Los precios cambiaron. Revisa el total y confirma nuevamente.');
      }
      await crearPedidoApi({ nombre, telefono: entrega.telefono, direccion, items: carrito.items });
      mostrarMensaje('Pedido registrado correctamente.', 'exito');
      carrito.vaciar();
      setEntrega({ nombre: sesion?.nombre ?? '', telefono: '', direccion: '' });
    } catch (error) {
      mostrarMensaje(mensajeErrorPedido(error), 'error');
    } finally {
      envioEnCurso.current = false;
      setProcesando(false);
    }
  };

  return (
    <>
      <section className="bg-white p-4 rounded border mb-4">
        <h2>Realizar pedido</h2>
        <p className="mb-0">
          Completa tus datos, agrega los cilindros al carrito y confirma tu pedido.
          Una vez confirmado no se puede modificar (solo cancelar mientras esté Pendiente).
        </p>
      </section>

      <Row className="g-4">
        {errorCatalogo && <p role="alert">{errorCatalogo}</p>}
        {avisoCarrito && catalogoListo && <p role="alert">{avisoCarrito}</p>}
        {!catalogoListo && !errorCatalogo && <p role="status">Cargando catálogo y carrito...</p>}
        {catalogoListo && <>
        <Col lg={6}>
          <section className="bg-white p-4 rounded border h-100">
            <FormularioPedido
              entrega={entrega}
              onCambiarEntrega={cambiarEntrega}
              onAgregar={(cilindro, cantidad) => avisarSiHayError(carrito.agregar(cilindro, cantidad))}
              cilindroInicial={cilindroInicial}
              maximo={carrito.maximo}
              procesando={procesando}
              productos={productosDisponibles}
            />
          </section>
        </Col>
        <Col lg={6}>
          <Carrito
            items={carrito.items}
            productosDisponibles={productosDisponibles}
            total={carrito.total}
            cantidadTotal={carrito.cantidadTotal}
            maximo={carrito.maximo}
            onEditar={(cilindro, cantidad) => avisarSiHayError(carrito.editar(cilindro, cantidad))}
            onQuitar={carrito.quitar}
            onConfirmar={confirmar}
            procesando={procesando}
          />
        </Col>
        </>}
      </Row>
    </>
  );
}
