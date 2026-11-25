import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaginaProductos from './PaginaProductos';
import { obtenerCatalogoPublico } from '../services/productosServicio';

vi.mock('../services/productosServicio', () => ({ obtenerCatalogoPublico: vi.fn() }));

it('informa cuando el backend no responde', async () => {
  obtenerCatalogoPublico.mockRejectedValue(new Error('Network Error'));
  render(<MemoryRouter><PaginaProductos /></MemoryRouter>);
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el catálogo');
});

it('informa cuando no hay productos activos', async () => {
  obtenerCatalogoPublico.mockResolvedValue([]);
  render(<MemoryRouter><PaginaProductos /></MemoryRouter>);
  expect(await screen.findByText('No hay productos disponibles.')).toBeInTheDocument();
});
