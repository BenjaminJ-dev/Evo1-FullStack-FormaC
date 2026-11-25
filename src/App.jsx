// src/App.jsx
// Define las rutas del sitio y qué rol puede entrar a cada una.
//   /, /productos, /login, /registro -> públicas
//   /pedido, /mis-pedidos -> solo clientes
//   /operador -> solo operador      /admin -> solo administrador
import { Navigate, Route, Routes } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import PaginaLogin from './pages/PaginaLogin';
import PaginaRegistro from './pages/PaginaRegistro';
import PaginaInicio from './pages/PaginaInicio';
import PaginaProductos from './pages/PaginaProductos';
import PaginaPedido from './pages/PaginaPedido';
import PaginaMisPedidos from './pages/PaginaMisPedidos';
import PaginaOperador from './pages/PaginaOperador';
import PaginaAdmin from './pages/PaginaAdmin';
import { useSesion } from './context/SesionContext';
import { rutaInicioPorRol } from './services/usuariosServicio';
import { ROLES } from './constantes';

// Cualquier ruta que no exista: se envía a la página de inicio del rol,
// o al login si no hay sesión.
function RutaDesconocida() {
  const { sesion } = useSesion();
  return <Navigate to={sesion ? rutaInicioPorRol(sesion.rol) : '/login'} replace />;
}

export default function App() {
  return (
    <CarritoProvider><Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/registro" element={<PaginaRegistro />} />

        <Route path="/" element={<PaginaInicio />} />
        <Route path="/productos" element={<PaginaProductos />} />
        <Route path="/pedido" element={<RutaProtegida permitirVisitante roles={[ROLES.CLIENTE]}><PaginaPedido /></RutaProtegida>} />
        <Route path="/mis-pedidos" element={<RutaProtegida roles={[ROLES.CLIENTE]}><PaginaMisPedidos /></RutaProtegida>} />

        <Route path="/operador" element={<RutaProtegida roles={[ROLES.OPERADOR]}><PaginaOperador /></RutaProtegida>} />
        <Route path="/admin" element={<RutaProtegida roles={[ROLES.ADMIN]}><PaginaAdmin /></RutaProtegida>} />

        <Route path="*" element={<RutaDesconocida />} />
      </Route>
    </Routes></CarritoProvider>
  );
}
