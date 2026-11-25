import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginaOperador from './PaginaOperador';
import { MensajeProvider } from '../context/MensajeContext';
import { clienteApi } from '../services/clienteApi';

vi.mock('../services/clienteApi', () => ({ clienteApi: { get: vi.fn(), patch: vi.fn() } }));

it('muestra carga, pedidos vacíos e inventario servido por la API', async () => {
  clienteApi.get.mockImplementation(async url => ({ data: url === '/pedidos' ? [] : [{ id: '5KG', nombre: 'Gas', total: 25, comprometido: 2, disponible: 23 }] }));
  render(<MensajeProvider><PaginaOperador /></MensajeProvider>);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando');
  expect(await screen.findByText('Todavía no hay pedidos registrados.')).toBeInTheDocument();
  expect(screen.getByText('23')).toBeInTheDocument();
  expect(clienteApi.get).toHaveBeenCalledWith('/pedidos');
  expect(clienteApi.get).toHaveBeenCalledWith('/inventario');
});

it('permite reintentar cuando el backend falla', async () => {
  clienteApi.get.mockRejectedValueOnce(new Error('Network Error'));
  render(<MensajeProvider><PaginaOperador /></MensajeProvider>);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
  clienteApi.get.mockImplementation(async () => ({ data: [] }));
  await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('Todavía no hay pedidos registrados.')).toBeInTheDocument();
});
