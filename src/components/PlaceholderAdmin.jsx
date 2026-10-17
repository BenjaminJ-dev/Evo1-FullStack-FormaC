// src/components/PlaceholderAdmin.jsx
// Apartado del panel de administración que todavía NO tiene funcionalidad.
// Muestra el esqueleto visual y deja claro que se hará en una entrega futura.
//
// Props: titulo, descripcion, children (contenido de ejemplo opcional)
export default function PlaceholderAdmin({ titulo, descripcion, children }) {
  return (
    <section className="bg-white p-4 rounded border mb-4">
      <h2 className="h4">{titulo}</h2>
      <div className="placeholder-admin p-3 rounded">
        <p>{descripcion}</p>
        <p className="fw-bold">Funcionalidad pendiente para una entrega posterior.</p>
        {children}
      </div>
    </section>
  );
}
