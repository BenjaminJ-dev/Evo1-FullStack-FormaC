// src/components/FormularioRegistro.jsx
// Registro de clientes nuevos. Valida cada campo y guarda al cliente;
// después lleva al login para que inicie sesión con la cuenta creada.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useMensaje } from '../context/MensajeContext';
import { registrarCliente } from '../services/usuariosServicio';
import { validarUsuario } from '../services/validaciones';

export default function FormularioRegistro() {
  const navigate = useNavigate();
  const { mostrarMensaje } = useMensaje();
  const [datos, setDatos] = useState({ nombre: '', usuario: '', password: '', confirmar: '' });

  const cambiar = (campo) => (e) =>
    setDatos((actuales) => ({ ...actuales, [campo]: e.target.value }));

  const enviar = (evento) => {
    evento.preventDefault();
    const nombre = datos.nombre.trim();
    const usuario = datos.usuario.trim();

    if (nombre === '') {
      mostrarMensaje('Debes ingresar tu nombre completo.', 'error');
      return;
    }
    if (usuario === '') {
      mostrarMensaje('Debes ingresar un nombre de usuario.', 'error');
      return;
    }
    if (!validarUsuario(usuario)) {
      mostrarMensaje(
        'El usuario debe tener al menos 4 caracteres y solo puede contener letras, números y guion bajo (sin espacios).',
        'error',
      );
      return;
    }
    if (datos.password.length < 6) {
      mostrarMensaje('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (datos.confirmar !== datos.password) {
      mostrarMensaje('Las contraseñas no coinciden.', 'error');
      return;
    }

    const resultado = registrarCliente({ nombre, usuario, password: datos.password });
    if (!resultado.ok) {
      mostrarMensaje(resultado.error, 'error');
      return;
    }

    mostrarMensaje('Cuenta creada correctamente. Serás redirigido para iniciar sesión...', 'exito');
    // Pequeña espera para alcanzar a leer el aviso
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <Form onSubmit={enviar} noValidate>
      <Form.Group className="mb-3" controlId="registroNombre">
        <Form.Label>Nombre completo</Form.Label>
        <Form.Control
          type="text"
          placeholder="Juan Alberto Pérez Muñoz"
          autoComplete="name"
          value={datos.nombre}
          onChange={cambiar('nombre')}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="registroUsuario">
        <Form.Label>Nombre de usuario</Form.Label>
        <Form.Control
          type="text"
          placeholder="Solo letras, números y guion bajo (mín. 4)"
          autoComplete="username"
          value={datos.usuario}
          onChange={cambiar('usuario')}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="registroPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={datos.password}
          onChange={cambiar('password')}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="registroConfirmar">
        <Form.Label>Confirmar contraseña</Form.Label>
        <Form.Control
          type="password"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={datos.confirmar}
          onChange={cambiar('confirmar')}
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="w-100">
        Crear cuenta
      </Button>
    </Form>
  );
}
