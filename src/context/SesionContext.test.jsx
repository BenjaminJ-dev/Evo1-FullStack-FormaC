import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, it, expect } from 'vitest';
import { SesionProvider } from './SesionContext';
import RutaProtegida from '../components/RutaProtegida';
import { guardarSesion, obtenerSesion } from '../services/usuariosServicio';
import { clienteApi } from '../services/clienteApi';

vi.mock('../services/clienteApi', () => ({ clienteApi: { get: vi.fn() } }));

function abrir() {
  return render(<MemoryRouter initialEntries={['/privada']}><SesionProvider><Routes>
    <Route path="/login" element={<p>Login</p>} />
    <Route path="/privada" element={<RutaProtegida roles={['cliente']}><p>Privado</p></RutaProtegida>} />
  </Routes></SesionProvider></MemoryRouter>);
}

it('espera /auth/me antes de mostrar una sesión guardada', async () => {
  guardarSesion({ accessToken: 'a', refreshToken: 'r', rol: 'CLIENTE', username: 'ana' });
  let resolver;
  clienteApi.get.mockImplementation(() => new Promise(resolve => { resolver = resolve; }));
  abrir();
  expect(screen.getByRole('status')).toHaveTextContent('Validando sesión');
  expect(screen.queryByText('Privado')).not.toBeInTheDocument();
  resolver({ data: { usuario: 'ana', rol: 'CLIENTE' } });
  expect(await screen.findByText('Privado')).toBeInTheDocument();
  expect(clienteApi.get).toHaveBeenCalledWith('/auth/me');
});

it('limpia la sesión y redirige si /auth/me falla tras el intento de renovación', async () => {
  guardarSesion({ accessToken: 'a', refreshToken: 'r', rol: 'CLIENTE', username: 'ana' });
  clienteApi.get.mockRejectedValue(new Error('refresh vencido'));
  abrir();
  expect(await screen.findByText('Login')).toBeInTheDocument();
  expect(obtenerSesion()).toBeNull();
});
