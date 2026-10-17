// src/components/RutaProtegida.jsx
// Protege una página: si no hay sesión, o el rol no está permitido,
// redirige a /login. Reemplaza a la antigua exigirSesion(roles).
//
// Uso:  <RutaProtegida roles={[ROLES.CLIENTE]}><PaginaInicio /></RutaProtegida>
//
// Nota: esta protección vive en el navegador, así que sirve para ordenar la
// navegación, no como seguridad real. TODO backend: la seguridad real se hará
// en el servidor, verificando el token en cada petición.
import { Navigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext';

export default function RutaProtegida({ roles, children }) {
  const { sesion } = useSesion();

  if (!sesion || !roles.includes(sesion.rol)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
