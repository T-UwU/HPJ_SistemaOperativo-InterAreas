// src/lib/areas.js: catálogos por defecto de áreas y salones del hotel.
//
// Estos son los valores de respaldo. En modo en línea, si las tablas
// `areas` y `salones` de Supabase tienen registros, la app usa esos en su
// lugar (ver src/store/data.js → hydrate). Así se pueden administrar desde
// Supabase igual que las habitaciones.

// Áreas comunes y salones usados por Limpieza (tareas) y Mantenimiento (tickets).
export const HOTEL_AREAS = [
  { id: 'salon-versalles', label: 'Salón Versalles' },
  { id: 'salon-jardin',    label: 'Salón Jardín' },
  { id: 'salon-terraza',   label: 'Salón Terraza' },
  { id: 'lobby',           label: 'Lobby principal' },
  { id: 'alberca',         label: 'Área de alberca' },
  { id: 'restaurante',     label: 'Restaurante' },
  { id: 'bar',             label: 'Bar / Lounge' },
  { id: 'gimnasio',        label: 'Gimnasio' },
  { id: 'spa',             label: 'Spa' },
  { id: 'elevadores',      label: 'Elevadores' },
  { id: 'pasillos',        label: 'Pasillos / Corredores' },
  { id: 'estacionamiento', label: 'Estacionamiento' },
  { id: 'roof',            label: 'Roof garden' },
];

// Salones usados por Ventas al crear o editar un evento.
export const EVENT_SALONES = [
  { id: 'salon-palacio',     name: 'Salón Palacio' },
  { id: 'sala-chapultepec',  name: 'Sala Chapultepec' },
  { id: 'terraza-principal', name: 'Terraza Principal' },
  { id: 'sala-ejecutiva',    name: 'Sala Ejecutiva' },
];
