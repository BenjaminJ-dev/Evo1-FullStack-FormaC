export function mensajeErrorApi(error) {
  if (error.response?.status === 401) return 'La sesión expiró. Inicia sesión nuevamente.';
  if (error.response?.status === 403) return 'No tienes permiso para realizar esta operación.';
  return error.response?.data?.detail || 'No se pudo conectar con el servidor. Inténtalo nuevamente.';
}
