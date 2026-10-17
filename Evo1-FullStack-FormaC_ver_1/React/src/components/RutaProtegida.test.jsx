// src/components/RutaProtegida.test.jsx
// Se prueba con un router en memoria (MemoryRouter), sin abrir un navegador.
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import { SesionProvider } from '../context/SesionContext';
import { CLAVES, ROLES } from '../constantes';

// Dibuja una ruta /privada solo para clientes, con la sesión indicada
function renderizarRutaPrivada(rolDeLaSesion) {
  if (rolDeLaSesion) {
    sessionStorage.setItem(
      CLAVES.SESION,
      JSON.stringify({ usuario: 'u1', rol: rolDeLaSesion, nombre: 'Usuario Uno' }),
    );
  }
  return render(
    <MemoryRouter initialEntries={['/privada']}>
      <SesionProvider>
        <Routes>
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route
            path="/privada"
            element={
              <RutaProtegida roles={[ROLES.CLIENTE]}>
                <p>Contenido privado</p>
              </RutaProtegida>
            }
          />
        </Routes>
      </SesionProvider>
    </MemoryRouter>,
  );
}

describe('RutaProtegida', () => {
  it('redirige a /login si no hay sesión o el rol no está permitido', () => {
    const sinSesion = renderizarRutaPrivada(null);
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    sinSesion.unmount();

    renderizarRutaPrivada(ROLES.OPERADOR); // un operador no puede ver páginas de cliente
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra el contenido cuando el rol de la sesión está permitido', () => {
    renderizarRutaPrivada(ROLES.CLIENTE);

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });
});
