// src/components/FormularioLogin.jsx
// Formulario de inicio de sesión. Valida los campos y, si las credenciales
// son correctas, guarda la sesión (la página de login redirige según el rol).
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useSesion } from '../context/SesionContext';
import { useMensaje } from '../context/MensajeContext';
import { autenticar } from '../services/usuariosServicio';

export default function FormularioLogin() {
  const { iniciarSesion } = useSesion();
  const { mostrarMensaje } = useMensaje();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const enviar = (evento) => {
    evento.preventDefault();
    const nombreUsuario = usuario.trim();

    if (nombreUsuario === '') {
      mostrarMensaje('Debes ingresar tu usuario.', 'error');
      return;
    }
    if (password === '') {
      mostrarMensaje('Debes ingresar tu contraseña.', 'error');
      return;
    }

    const sesion = autenticar(nombreUsuario, password);
    if (!sesion) {
      mostrarMensaje('Usuario o contraseña incorrectos.', 'error');
      return;
    }
    iniciarSesion(sesion);
  };

  return (
    <Form onSubmit={enviar} noValidate>
      <Form.Group className="mb-3" controlId="loginUsuario">
        <Form.Label>Usuario</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ingresa tu usuario"
          autoComplete="username"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="loginPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="w-100">
        Ingresar
      </Button>
    </Form>
  );
}
