import { vi, it, expect } from 'vitest';
import { autenticar, obtenerSesion, cerrarSesion, guardarSesion } from './usuariosServicio';
import { clienteApi } from './clienteApi';

vi.mock('./clienteApi', () => ({ clienteApi: { post: vi.fn() } }));

it('usa login del servidor y recupera la sesión tras una nueva lectura', async () => {
  clienteApi.post.mockResolvedValueOnce({ data: { accessToken: 'access', refreshToken: 'refresh', username: 'ana', nombre: 'Ana', rol: 'CLIENTE' } });
  expect((await autenticar('ana', 'clave')).rol).toBe('cliente');
  expect(clienteApi.post).toHaveBeenCalledWith('/auth/login', { usuario: 'ana', password: 'clave' });
  expect(obtenerSesion().usuario).toBe('ana');
});

it('revoca el refresh token y limpia la sesión al salir', async () => {
  guardarSesion({ accessToken: 'access', refreshToken: 'refresh', username: 'ana', rol: 'CLIENTE' });
  clienteApi.post.mockResolvedValueOnce({ status: 204 });
  await cerrarSesion();
  expect(clienteApi.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh' });
  expect(obtenerSesion()).toBeNull();
});
