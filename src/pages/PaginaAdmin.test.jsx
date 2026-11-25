import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { SesionProvider } from '../context/SesionContext';
import { MensajeProvider } from '../context/MensajeContext';
import { guardarSesion } from '../services/usuariosServicio';
import { obtenerProducto } from '../services/productosServicio';
import { clienteApi } from '../services/clienteApi';
import { vi } from 'vitest';

vi.mock('../services/clienteApi', () => ({ clienteApi: { get: vi.fn(), delete: vi.fn(), put: vi.fn(), post: vi.fn() } }));
let activo = true;
beforeEach(() => {
  activo = true;
  clienteApi.get.mockImplementation(async url => {
    if (url === '/auth/me') return { data: { rol: 'ADMINISTRADOR' } };
    if (url === '/admin/indicadores') return { data: { productosActivos: 1, clientesRegistrados: 0, PENDIENTE: 0, EN_CAMINO: 0, ENTREGADO: 0, CANCELADO: 0, stockDisponible: 25, montoPedidosEntregados: 0 } };
    if (url === '/admin/usuarios' || url === '/pedidos' || url === '/inventario') return { data: [] };
    if (url === '/admin/productos') return { data: [{ id: '5KG', nombre: 'Cilindro GLP 5KG', descripcion: 'Gas', precio: 6000, activo }] };
    throw new Error(url);
  });
  clienteApi.delete.mockImplementation(async () => { activo = false; return { status: 204 }; });
});
const abrir = rol => {
  guardarSesion({ accessToken: 'access', refreshToken: 'refresh', rol: rol === 'admin' ? 'ADMINISTRADOR' : rol.toUpperCase(), nombre: 'Prueba', username: 'prueba' });
  render(<MemoryRouter initialEntries={['/admin']}><SesionProvider><MensajeProvider><App /></MensajeProvider></SesionProvider></MemoryRouter>);
};
it('navega por secciones, muestra vacios y desactiva con confirmacion', async () => {
  const usuario = userEvent.setup();
  abrir('admin');
  expect(await screen.findByText('Clientes registrados')).toBeInTheDocument();
  await usuario.click(screen.getByRole('button', { name: 'Pedidos', exact: true }));
  expect(screen.getByText('No hay pedidos registrados.')).toBeInTheDocument();
  await usuario.click(screen.getByRole('button', { name: 'Usuarios', exact: true }));
  expect(screen.queryByText('admin123')).not.toBeInTheDocument();
  await usuario.click(screen.getByRole('button', { name: 'Inventario', exact: true }));
  expect(screen.getByText('No hay inventario registrado.')).toBeInTheDocument();
  await usuario.click(screen.getByRole('button', { name: 'Productos', exact: true }));
  const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
  await usuario.click(screen.getByRole('button', { name: 'Desactivar 5KG', exact: true }));
  expect(obtenerProducto('5KG').activo).toBe(true);
  confirmar.mockReturnValue(true);
  await usuario.click(screen.getByRole('button', { name: 'Desactivar 5KG', exact: true }));
  expect(await screen.findByText('Inactivo')).toBeInTheDocument();
  expect(clienteApi.delete).toHaveBeenCalledWith('/admin/productos/5KG');
  confirmar.mockRestore();
});
it.each(['cliente','operador'])('impide abrir administracion como %s', rol => {
  abrir(rol);
  expect(screen.queryByRole('button', { name: 'Crear producto' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument();
});
