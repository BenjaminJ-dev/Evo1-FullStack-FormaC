import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SesionProvider } from '../context/SesionContext';
import { MensajeProvider } from '../context/MensajeContext';
import { CarritoProvider } from '../context/CarritoContext';
import BannerMensaje from '../components/BannerMensaje';
import PaginaPedido from './PaginaPedido';
import { guardarSesion } from '../services/usuariosServicio';
import { obtenerCatalogoPublico } from '../services/productosServicio';
import { clienteApi } from '../services/clienteApi';

vi.mock('../services/productosServicio', async importOriginal => ({ ...(await importOriginal()), obtenerCatalogoPublico: vi.fn() }));

it('conserva el carrito y explica la caída del backend', async () => {
  vi.spyOn(clienteApi, 'get').mockResolvedValue({ data: { usuario: 'ana', rol: 'CLIENTE' } });
  guardarSesion({ accessToken: 'access', refreshToken: 'refresh', username: 'ana', nombre: 'Ana', rol: 'CLIENTE' });
  obtenerCatalogoPublico.mockResolvedValueOnce([{ id: '5KG', nombre: 'Cilindro GLP 5KG', precio: 6000, activo: true }])
    .mockRejectedValueOnce({ isAxiosError: true, message: 'Network Error' });
  const ui = userEvent.setup();
  render(<MemoryRouter><SesionProvider><MensajeProvider><BannerMensaje /><CarritoProvider><PaginaPedido /></CarritoProvider></MensajeProvider></SesionProvider></MemoryRouter>);
  await ui.type(await screen.findByLabelText(/Teléfono/), '912345678');
  await ui.type(screen.getByLabelText('Dirección'), 'Calle 1');
  await screen.findByRole('option', { name: 'Cilindro GLP 5KG' });
  await ui.selectOptions(screen.getByLabelText('Tipo de cilindro'), '5KG');
  await ui.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
  await ui.click(screen.getByRole('button', { name: 'Confirmar pedido' }));
  expect(await screen.findByText('No se pudo conectar con el servidor. El carrito sigue intacto.')).toBeInTheDocument();
  expect(screen.getByText('1 de 4 cilindros')).toBeInTheDocument();
});
