import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, it, expect } from 'vitest';
import { CarritoProvider, CLAVE_CARRITO } from '../context/CarritoContext';
import { SesionProvider } from '../context/SesionContext';
import { MensajeProvider } from '../context/MensajeContext';
import PaginaPedido from './PaginaPedido';
import { obtenerCatalogoPublico } from '../services/productosServicio';

vi.mock('../services/productosServicio', async original => ({ ...(await original()), obtenerCatalogoPublico: vi.fn() }));

function abrir() {
  return render(<MemoryRouter><SesionProvider><MensajeProvider><CarritoProvider><PaginaPedido /></CarritoProvider></MensajeProvider></SesionProvider></MemoryRouter>);
}

it('oculta el precio guardado hasta obtener y aplicar el vigente', async () => {
  sessionStorage.setItem(CLAVE_CARRITO, JSON.stringify([{ cilindro: '5KG', cantidad: 2, precioUnitario: 6000, nombre: 'Nombre anterior' }]));
  obtenerCatalogoPublico.mockResolvedValue([{ id: '5KG', nombre: 'Nombre actual', precio: 7000, activo: true }]);
  abrir();
  expect(screen.queryByText('Nombre anterior')).not.toBeInTheDocument();
  expect(await screen.findByText('Se actualizaron precios del carrito.')).toBeInTheDocument();
  expect(screen.getByText('2 de 4 cilindros')).toBeInTheDocument();
  expect((await screen.findAllByText('$14.000')).length).toBeGreaterThan(0);
});

it('conserva el producto desactivado y bloquea la confirmación', async () => {
  sessionStorage.setItem(CLAVE_CARRITO, JSON.stringify([{ cilindro: '5KG', cantidad: 1, precioUnitario: 6000, nombre: 'Nombre anterior' }]));
  obtenerCatalogoPublico.mockResolvedValue([]);
  abrir();
  expect(await screen.findByText(/Hay productos desactivados o no disponibles/)).toBeInTheDocument();
  expect(screen.getByText('Producto 5KG no disponible')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirmar pedido' })).toBeDisabled();
  expect(screen.getByText('1 de 4 cilindros')).toBeInTheDocument();
});
