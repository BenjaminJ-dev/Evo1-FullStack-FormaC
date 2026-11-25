import { obtenerProductoCompra } from '../services/productosServicio';
// src/hooks/useCarrito.js
// Operaciones del carrito; persistencia opcional suministrada por CarritoProvider.
import { useEffect, useState } from 'react';
import { MAX_CANTIDAD } from '../constantes';
import { validarCantidad } from '../services/validaciones';

export default function useCarrito(maximo = MAX_CANTIDAD, persistencia = null) {
  const [items, setItems] = useState(() => persistencia?.leer(maximo) ?? []); // [{ cilindro, cantidad, precioUnitario }]

  useEffect(() => { persistencia?.guardar(items); }, [items, persistencia]);

  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);
  const total = items.reduce((suma, item) => suma + item.cantidad * item.precioUnitario, 0);

  const agregar = (cilindro, cantidad) => {
    if (!cilindro) {
      return { ok: false, error: 'Debes seleccionar un cilindro.' };
    }
    const producto = obtenerProductoCompra(cilindro);
    if (!producto?.activo) {
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
      return [...actuales, { cilindro, cantidad, precioUnitario: producto.precio, nombre: producto.nombre }];
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

  const actualizarPrecios = () => setItems(actuales => actuales.map(item => ({ ...item, precioUnitario: obtenerProductoCompra(item.cilindro)?.precio ?? item.precioUnitario })));
  const actualizarPreciosDesdeCatalogo = (productos) => setItems(actuales => actuales.map(item => {
    const producto = productos.find(p => p.id === item.cilindro);
    return producto ? { ...item, precioUnitario: producto.precio, nombre: producto.nombre } : item;
  }));
  return { actualizarPrecios, actualizarPreciosDesdeCatalogo, items, cantidadTotal, total, maximo, agregar, editar, quitar, vaciar };
}
