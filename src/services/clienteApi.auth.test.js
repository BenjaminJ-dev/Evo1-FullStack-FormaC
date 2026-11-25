import { vi, it, expect } from 'vitest';
import axios from 'axios';
import { clienteApi } from './clienteApi';
import { guardarSesion, obtenerSesion } from './usuariosServicio';

it('renueva tras 401 y repite la petición con el token nuevo', async () => {
  guardarSesion({ accessToken: 'viejo', refreshToken: 'r1', username: 'ana', rol: 'CLIENTE' });
  const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'nuevo', refreshToken: 'r2', username: 'ana', rol: 'CLIENTE' } });
  const adapterAnterior = clienteApi.defaults.adapter;
  const llamadas = [];
  clienteApi.defaults.adapter = async config => {
    llamadas.push(config.headers.Authorization);
    if (llamadas.length === 1) throw new axios.AxiosError('caducado', 'ERR_BAD_RESPONSE', config, null, { status: 401, data: {}, headers: {}, config });
    return { status: 200, data: { usuario: 'ana' }, headers: {}, config };
  };
  try {
    expect((await clienteApi.get('/auth/me')).data.usuario).toBe('ana');
    expect(llamadas).toEqual(['Bearer viejo', 'Bearer nuevo']);
    expect(refresh).toHaveBeenCalledWith(expect.stringContaining('/auth/refresh'), { refreshToken: 'r1' });
    expect(obtenerSesion().refreshToken).toBe('r2');
  } finally { clienteApi.defaults.adapter = adapterAnterior; refresh.mockRestore(); }
});
