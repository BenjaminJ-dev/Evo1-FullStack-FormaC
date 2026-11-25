import axios from 'axios';
import { obtenerSesion, guardarSesion, borrarSesion } from './usuariosServicio';

export const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
});

clienteApi.interceptors.request.use(config => {
  const token = obtenerSesion()?.accessToken;
  if (token && !['/auth/login', '/auth/registro', '/auth/refresh', '/auth/logout'].includes(config.url)) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let renovacionEnCurso;
clienteApi.interceptors.response.use(respuesta => respuesta, async error => {
  const original = error.config;
  if (error.response?.status !== 401 || !original || original._reintento || ['/auth/login', '/auth/registro', '/auth/refresh', '/auth/logout'].includes(original.url)) return Promise.reject(error);
  const sesion = obtenerSesion();
  if (!sesion?.refreshToken) return Promise.reject(error);
  original._reintento = true;
  try {
    if (!renovacionEnCurso) renovacionEnCurso = axios.post(`${clienteApi.defaults.baseURL}/auth/refresh`, { refreshToken: sesion.refreshToken })
      .then(({ data }) => { guardarSesion(data); return data.accessToken; })
      .finally(() => { renovacionEnCurso = null; });
    original.headers.Authorization = `Bearer ${await renovacionEnCurso}`;
    return clienteApi(original);
  } catch (fallo) { borrarSesion(); return Promise.reject(fallo); }
});
