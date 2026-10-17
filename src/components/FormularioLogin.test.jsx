// src/components/FormularioLogin.test.jsx
// Se prueba el comportamiento visto por el usuario: escribir, presionar
// el botón y ver el aviso de error en el banner.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioLogin from './FormularioLogin';
import BannerMensaje from './BannerMensaje';
import { SesionProvider } from '../context/SesionContext';
import { MensajeProvider } from '../context/MensajeContext';

function renderizarLogin() {
  return render(
    <SesionProvider>
      <MensajeProvider>
        <BannerMensaje />
        <FormularioLogin />
      </MensajeProvider>
    </SesionProvider>,
  );
}

describe('FormularioLogin', () => {
  it('muestra un aviso claro por cada error: campos vacíos y credenciales incorrectas', async () => {
    const usuario = userEvent.setup();
    renderizarLogin();

    // 1) Nada escrito -> pide el usuario
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Debes ingresar tu usuario.')).toBeInTheDocument();

    // 2) Solo usuario -> pide la contraseña
    await usuario.type(screen.getByLabelText('Usuario'), 'operador');
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Debes ingresar tu contraseña.')).toBeInTheDocument();

    // 3) Contraseña equivocada -> avisa que son incorrectas
    await usuario.type(screen.getByLabelText('Contraseña'), 'mala-clave');
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeInTheDocument();
  });
});
