// src/services/pedidosServicio.test.js
// Pruebas de las reglas de negocio: inventario, cancelación y stock.
// El almacenamiento del navegador se limpia solo entre pruebas (setupTests.js).
import {
  avanzarEstado,
  calcularDisponible,
  calcularPendiente,
  cancelarItem,
  cancelarPedido,
  crearPedido,
  obtenerPedidos,
  obtenerResumenInventario,
  sePuedeCancelar,
} from './pedidosServicio';
import { ESTADOS } from '../constantes';

// Ayudas para armar datos de prueba
const item = (cilindro, cantidad) => ({ cilindro, cantidad, precioUnitario: 1000 });
const datosPedido = (items) => ({
  usuario: 'cliente1',
  nombre: 'Cliente Uno',
  telefono: '912345678',
  direccion: 'Calle 1',
  items,
});

describe('pedidosServicio', () => {
  it('calcula "Pendiente" sin contar ítems cancelados y "Disponible" = Total - Pendiente', () => {
    const { pedido: a } = crearPedido(datosPedido([item('5KG', 2), item('11KG', 1)]));
    crearPedido(datosPedido([item('5KG', 3)]));
    cancelarItem(a.id, 1); // se cancela el ítem de 11KG

    expect(calcularPendiente('5KG')).toBe(5);
    expect(calcularPendiente('11KG')).toBe(0);      // cancelado: ya no cuenta
    expect(calcularDisponible('5KG')).toBe(25 - 5); // Total inicial 25
  });

  it('al cancelar el último ítem activo, el pedido completo pasa a "Cancelado"', () => {
    const { pedido } = crearPedido(datosPedido([item('5KG', 1), item('15KG', 1)]));

    cancelarItem(pedido.id, 0);
    expect(obtenerPedidos()[0].estado).toBe(ESTADOS.PENDIENTE); // aún queda un ítem activo

    cancelarItem(pedido.id, 1);
    expect(obtenerPedidos()[0].estado).toBe(ESTADOS.CANCELADO);
  });

  it('rechaza el pedido completo si falta stock y avisa qué producto', () => {
    expect(crearPedido(datosPedido([item('45KG', 8)])).ok).toBe(true); // usa todo el stock (8)

    const resultado = crearPedido(datosPedido([item('5KG', 1), item('45KG', 1)]));

    expect(resultado.ok).toBe(false);
    expect(resultado.sinStock).toEqual(['Cilindro GLP 45KG']);
    expect(obtenerPedidos()).toHaveLength(1); // no se creó el segundo pedido
  });

  it('solo se cancela en "Pendiente" y el Total baja recién al entregar', () => {
    const { pedido } = crearPedido(datosPedido([item('5KG', 2)]));
    expect(sePuedeCancelar(pedido)).toBe(true);

    avanzarEstado(pedido.id); // Pendiente -> En camino
    expect(cancelarPedido(pedido.id).ok).toBe(false); // ya salió el camión
    let inventario = obtenerResumenInventario().find((p) => p.id === '5KG');
    expect(inventario).toMatchObject({ total: 25, pendiente: 2, disponible: 23 });

    avanzarEstado(pedido.id); // En camino -> Entregado
    inventario = obtenerResumenInventario().find((p) => p.id === '5KG');
    expect(inventario).toMatchObject({ total: 23, pendiente: 0, disponible: 23 });
  });
});
