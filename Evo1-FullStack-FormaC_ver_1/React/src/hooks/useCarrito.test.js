// src/hooks/useCarrito.test.js
// Pruebas del hook del carrito usando renderHook (sin dibujar pantallas).
import { act, renderHook } from '@testing-library/react';
import useCarrito from './useCarrito';

describe('useCarrito', () => {
  it('agrega ítems y suma la cantidad si el cilindro ya está en el carrito', () => {
    const { result } = renderHook(() => useCarrito());

    act(() => { result.current.agregar('5KG', 1); });
    act(() => { result.current.agregar('5KG', 2); });

    expect(result.current.items).toHaveLength(1);       // una sola línea de 5KG
    expect(result.current.items[0].cantidad).toBe(3);
    expect(result.current.total).toBe(3 * 6000);
  });

  it('rechaza agregar cuando se supera el máximo de 4 cilindros por pedido', () => {
    const { result } = renderHook(() => useCarrito());
    act(() => { result.current.agregar('5KG', 3); });

    let respuesta;
    act(() => { respuesta = result.current.agregar('15KG', 2); }); // 3 + 2 = 5 > 4

    expect(respuesta.ok).toBe(false);
    expect(respuesta.error).toMatch(/Máximo 4/);
    expect(result.current.items).toHaveLength(1);       // no se agregó nada
  });

  it('edita la cantidad respetando el máximo y quita ítems recalculando el total', () => {
    const { result } = renderHook(() => useCarrito());
    act(() => { result.current.agregar('5KG', 2); });
    act(() => { result.current.agregar('11KG', 1); });

    act(() => { result.current.editar('5KG', 3); });    // total 4: permitido
    expect(result.current.cantidadTotal).toBe(4);

    let respuesta;
    act(() => { respuesta = result.current.editar('5KG', 4); }); // total 5: no
    expect(respuesta.ok).toBe(false);

    act(() => { result.current.quitar('11KG'); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(3 * 6000);
  });
});
