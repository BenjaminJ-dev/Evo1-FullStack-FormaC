// src/hooks/useCarrito.js
// Carrito de la página de pedido: agregar, editar y quitar ítems ANTES de
// confirmar. Vive solo en memoria (se pierde al recargar la página).
// Cada acción devuelve { ok: true } o { ok: false, error: 'mensaje' }.
import { useState } from 'react';
import { MAX_CANTIDAD, obtenerProducto } from '../constantes';
import { validarCantidad } from '../services/validaciones';

export default function useCarrito(maximo = MAX_CANTIDAD) {
  const [items, setItems] = useState([]); // [{ cilindro, cantidad, precioUnitario }]

  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);
  const total = items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);

  const agregar = (cilindro, cantidad) => {
    if (!cilindro) {
      return { ok: false, error: 'Debes seleccionar un cilindro.' };
    }
    const producto = obtenerProducto(cilindro);
    if (!producto) {
      return { ok: false, error: 'Selecciona un cilindro válido.' };
    }
    if (!validarCantidad(cantidad, maximo)) {
      return { ok: false, error: `La cantidad debe ser un número entero entre 1 y ${maximo}.` };
    }
    if (cantidadTotal + cantidad > maximo) {
      return {
        ok: false,
        error: `Máximo ${maximo} cilindros por pedido (ya tienes ${cantidadTotal} en el carrito).`,
      };
    }
    // Se usa el estado más reciente para evitar perder cambios agrupados por React.
    setItems((actuales) => {
      const existente = actuales.find((item) => item.cilindro === cilindro);
      if (existente) {
        return actuales.map((item) =>
          item.cilindro === cilindro ? { ...item, cantidad: item.cantidad + cantidad } : item,
        );
      }
      return [...actuales, { cilindro, cantidad, precioUnitario: producto.precio }];
    });
    return { ok: true };
  };

  const editar = (cilindro, nuevaCantidad) => {
    const actual = items.find((item) => item.cilindro === cilindro);
    if (!actual) {
      return { ok: false, error: 'Ese cilindro no está en el carrito.' };
    }
    if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
      return { ok: false, error: 'La cantidad debe ser al menos 1 (o quita el cilindro del carrito).' };
    }
    if (cantidadTotal - actual.cantidad + nuevaCantidad > maximo) {
      return { ok: false, error: `Máximo ${maximo} cilindros por pedido.` };
    }
    setItems((actuales) => actuales.map((item) =>
      item.cilindro === cilindro ? { ...item, cantidad: nuevaCantidad } : item,
    ));
    return { ok: true };
  };

  const quitar = (cilindro) => {
    setItems((actuales) => actuales.filter((item) => item.cilindro !== cilindro));
  };

  const vaciar = () => setItems([]);

  return { items, cantidadTotal, total, maximo, agregar, editar, quitar, vaciar };
}
