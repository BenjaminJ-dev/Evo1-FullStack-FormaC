// src/components/TablaPedidos.test.jsx
// Se usa un MOCK de window.confirm (vi.spyOn) para simular que la persona
// acepta o rechaza el aviso del navegador, y una función espía (vi.fn)
// para comprobar si el componente avisó a la página.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TablaPedidos from './TablaPedidos';
import { ESTADOS } from '../constantes';

const pedidoPendiente = {
  id: 'p1',
  usuario: 'cliente1',
  nombre: 'Cliente Uno',
  telefono: '912345678',
  direccion: 'Calle 1',
  estado: ESTADOS.PENDIENTE,
  fecha: '01-01-2026',
  items: [{ cilindro: '5KG', cantidad: 2, precioUnitario: 6000, cancelado: false }],
};

describe('TablaPedidos', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pide confirmación antes de cancelar y solo cancela si se acepta', async () => {
    const usuario = userEvent.setup();
    const onCancelarPedido = vi.fn();
    const confirmar = vi.spyOn(window, 'confirm');
    render(
      <TablaPedidos
        pedidos={[pedidoPendiente]}
        modo="cliente"
        onCancelarPedido={onCancelarPedido}
        onCancelarItem={vi.fn()}
      />,
    );

    // La persona rechaza el aviso -> no se cancela nada
    confirmar.mockReturnValue(false);
    await usuario.click(screen.getByRole('button', { name: 'Cancelar pedido' }));
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(onCancelarPedido).not.toHaveBeenCalled();

    // La persona acepta el aviso -> se cancela ese pedido
    confirmar.mockReturnValue(true);
    await usuario.click(screen.getByRole('button', { name: 'Cancelar pedido' }));
    expect(onCancelarPedido).toHaveBeenCalledWith('p1');
  });
});
