// src/components/RutaProtegida.test.jsx
// Se prueba con un router en memoria (MemoryRouter), sin abrir un navegador.
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import { SesionProvider } from '../context/SesionContext';
import { CLAVES, ROLES } from '../constantes';
import { guardarSesion } from '../services/usuariosServicio';
import { clienteApi } from '../services/clienteApi';
import { vi } from 'vitest';
vi.mock('../services/clienteApi', () => ({ clienteApi: { get: vi.fn().mockResolvedValue({ data: {} }) } }));

// Dibuja una ruta /privada solo para clientes, con la sesión indicada
function renderizarRutaPrivada(rolDeLaSesion) {
  if (rolDeLaSesion) {
    guardarSesion({ accessToken: 'access', refreshToken: 'refresh', username: 'u1', rol: rolDeLaSesion.toUpperCase(), nombre: 'Usuario Uno' });
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
  it('redirige a /login si no hay sesión o el rol no está permitido', async () => {
    const sinSesion = renderizarRutaPrivada(null);
    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
    sinSesion.unmount();

    renderizarRutaPrivada(ROLES.OPERADOR); // un operador no puede ver páginas de cliente
    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra el contenido cuando el rol de la sesión está permitido', async () => {
    renderizarRutaPrivada(ROLES.CLIENTE);

    expect(await screen.findByText('Contenido privado')).toBeInTheDocument();
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
  });
});
