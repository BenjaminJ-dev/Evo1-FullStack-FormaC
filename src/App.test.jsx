import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { SesionProvider } from './context/SesionContext';
import { MensajeProvider } from './context/MensajeContext';
import { CLAVES, ROLES } from './constantes';
import { vi } from 'vitest';
import { clienteApi } from './services/clienteApi';
import { guardarSesion } from './services/usuariosServicio';

vi.mock('./services/clienteApi', () => ({ clienteApi: { get: vi.fn(), post: vi.fn() } }));

beforeEach(() => {
  clienteApi.post.mockImplementation(url => url === '/auth/login' ? Promise.resolve({ data: { accessToken: 'access', refreshToken: 'refresh', username: 'clienteprueba', nombre: 'Cliente Prueba', rol: 'CLIENTE' } }) : Promise.resolve({ data: {} }));
  clienteApi.get.mockResolvedValue({ data: [
    { id: '5KG', nombre: 'Cilindro GLP 5KG', descripcion: 'Gas', precio: 6000, activo: true },
    { id: '11KG', nombre: 'Cilindro GLP 11KG', descripcion: 'Gas', precio: 11000, activo: true },
    { id: '15KG', nombre: 'Cilindro GLP 15KG', descripcion: 'Gas', precio: 14500, activo: true },
    { id: '45KG', nombre: 'Cilindro GLP 45KG', descripcion: 'Gas', precio: 40000, activo: true },
  ] });
});

function abrir(ruta, rol = null) {
  if (rol) {
    guardarSesion({ accessToken: 'access', refreshToken: 'refresh', username: 'prueba', nombre: 'Usuario de prueba', rol: rol.toUpperCase() === 'ADMIN' ? 'ADMINISTRADOR' : rol.toUpperCase() });
  }
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider>
        <MensajeProvider><App /></MensajeProvider>
      </SesionProvider>
    </MemoryRouter>,
  );
}

describe('Navegación pública y rutas privadas', () => {
  it('permite navegar desde Inicio al catálogo sin sesión y muestra los precios', async () => {
    const usuario = userEvent.setup();
    abrir('/');
    expect(screen.getByRole('heading', { name: 'Gas el volcán' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/registro');
    expect(screen.queryByRole('link', { name: 'Mis pedidos' })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('link', { name: 'Productos' }));
    for (const [nombre, precio] of [
      ['Cilindro GLP 5KG', '$6.000'], ['Cilindro GLP 11KG', '$11.000'],
      ['Cilindro GLP 15KG', '$14.500'], ['Cilindro GLP 45KG', '$40.000'],
    ]) {
      expect(await screen.findByRole('heading', { name: nombre })).toBeInTheDocument();
      expect(screen.getByText(`Precio: ${precio}`)).toBeInTheDocument();
    }
  });

  it('permite entrar directamente al catálogo y permite preparar el pedido', async () => {
    const usuario = userEvent.setup();
    abrir('/productos');
    expect(screen.getByRole('heading', { name: 'Nuestros productos' })).toBeInTheDocument();
    await usuario.click((await screen.findAllByRole('button', { name: 'Comprar' }))[0]);
    expect(screen.getByRole('heading', { name: 'Realizar pedido' })).toBeInTheDocument();
  });

  it.each(['/mis-pedidos', '/operador', '/admin'])(
    'redirige al login al visitante que intenta abrir %s', (ruta) => {
      abrir(ruta);
      expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    },
  );

  it.each(['/operador', '/admin'])(
    'impide al cliente acceder a %s', async (ruta) => {
      abrir(ruta, ROLES.CLIENTE);
      expect(await screen.findByRole('heading', { name: 'Gas el volcán' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Panel de administración' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Pedidos realizados' })).not.toBeInTheDocument();
    },
  );

  it.each([
    ['/operador', ROLES.OPERADOR, 'Pedidos realizados'],
    ['/admin', ROLES.ADMIN, 'Panel de administración'],
    ['/pedido', ROLES.CLIENTE, 'Realizar pedido'],
  ])('mantiene el acceso autorizado a %s', async (ruta, rol, titulo) => {
    abrir(ruta, rol);
    expect(await screen.findByRole('heading', { name: titulo })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });
});


describe('Carrito de visitante', () => {
  it('conserva cantidades al recargar y exige sesión solo al confirmar', async () => {
    const usuario = userEvent.setup();
    const vista = abrir('/pedido?cilindro=5KG');
    await usuario.click(await screen.findByRole('button', { name: 'Agregar al carrito' }));
    await usuario.click(screen.getByRole('button', { name: 'Agregar una unidad de Cilindro GLP 5KG' }));
    expect(await screen.findByText('2 de 4 cilindros')).toBeInTheDocument();
    vista.unmount();
    abrir('/pedido');
    expect(await screen.findByText('2 de 4 cilindros')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Confirmar pedido' }));
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('regresa desde registro y login al carrito seleccionado', async () => {
    const usuario = userEvent.setup();
    abrir('/pedido?cilindro=5KG');
    await usuario.click(await screen.findByRole('button', { name: 'Agregar al carrito' }));
    await usuario.click(screen.getByRole('button', { name: 'Confirmar pedido' }));
    await usuario.click(screen.getByRole('link', { name: 'Regístrate aquí' }));
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Cliente Prueba');
    await usuario.type(screen.getByLabelText('Nombre de usuario'), 'clienteprueba');
    await usuario.type(screen.getByLabelText('Contraseña', { exact: true }), 'clave123');
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'clave123');
    await usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByRole('heading', { name: 'Iniciar sesión' }, { timeout: 3000 });
    await usuario.type(screen.getByLabelText('Usuario'), 'clienteprueba');
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave123');
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('heading', { name: 'Realizar pedido' })).toBeInTheDocument();
    expect(await screen.findByText('1 de 4 cilindros')).toBeInTheDocument();
  });
});

it('permite abrir pedido directamente como visitante', () => {
  abrir('/pedido');
  expect(screen.getByRole('heading', { name: 'Realizar pedido' })).toBeInTheDocument();
});
