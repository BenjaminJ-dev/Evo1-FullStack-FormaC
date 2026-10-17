// src/main.jsx
// Punto de entrada. Aquí se cargan los estilos (Bootstrap + temas) y se
// montan los "proveedores" de estado global alrededor de toda la app:
//   BrowserRouter  -> navegación entre páginas
//   SesionProvider -> quién está logueado
//   MensajeProvider -> avisos de error/éxito
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/temas.css';
import App from './App.jsx';
import { SesionProvider } from './context/SesionContext';
import { MensajeProvider } from './context/MensajeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <MensajeProvider>
          <App />
        </MensajeProvider>
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
);
