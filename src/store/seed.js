// src/store/seed.js — estado inicial vacío (listo para demo en vivo).
// Las habitaciones son la estructura del hotel; todo lo demás arranca vacío.

import { HOTEL_AREAS, EVENT_SALONES } from '../lib/areas.js';

export const seed = {
  // ─── Catálogos editables desde Supabase (respaldo a estos valores) ───
  areas:   HOTEL_AREAS,
  salones: EVENT_SALONES,

  // ─── Habitaciones (71 en 8 pisos) ────────────────────────────
  rooms: [
    // Piso 1
    { id: '101', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '102', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '103', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '104', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '105', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '106', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '107', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '108', floor: 1, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '118', floor: 1, type: 'Familiar',      status: 'limpia', guest: null },
    { id: '119', floor: 1, type: 'Familiar',      status: 'limpia', guest: null },
    // Piso 2
    { id: '201', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '202', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '203', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '204', floor: 2, type: 'Doble Superior', status: 'limpia', guest: null },
    { id: '205', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '206', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '207', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '208', floor: 2, type: 'Doble Superior', status: 'limpia', guest: null },
    { id: '209', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '217', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '221', floor: 2, type: 'Estándar',      status: 'limpia', guest: null },
    // Piso 3
    { id: '301', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '302', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '303', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '304', floor: 3, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '305', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '306', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '307', floor: 3, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '308', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '309', floor: 3, type: 'Estándar',      status: 'limpia', guest: null },
    // Piso 4
    { id: '401', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '402', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '403', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '404', floor: 4, type: 'Doble Superior', status: 'limpia', guest: null },
    { id: '405', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '406', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '407', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '408', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '409', floor: 4, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '410', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '411', floor: 4, type: 'Estándar',      status: 'limpia', guest: null },
    { id: '412', floor: 4, type: 'Suite',         status: 'limpia', guest: null },
    // Piso 5
    { id: '501', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '502', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '503', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '504', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '505', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '506', floor: 5, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '507', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '508', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '509', floor: 5, type: 'Superior',      status: 'limpia', guest: null },
    { id: '510', floor: 5, type: 'Suite',         status: 'limpia', guest: null },
    // Piso 6
    { id: '601', floor: 6, type: 'Superior',      status: 'limpia', guest: null },
    { id: '602', floor: 6, type: 'Superior',      status: 'limpia', guest: null },
    { id: '603', floor: 6, type: 'Superior',      status: 'limpia', guest: null },
    { id: '604', floor: 6, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '605', floor: 6, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '606', floor: 6, type: 'Superior',      status: 'limpia', guest: null },
    // Piso 7
    { id: '701', floor: 7, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '702', floor: 7, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '703', floor: 7, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '704', floor: 7, type: 'Suite',         status: 'limpia', guest: null },
    { id: '705', floor: 7, type: 'Junior Suite',  status: 'limpia', guest: null },
    { id: '706', floor: 7, type: 'Suite',         status: 'limpia', guest: null },
    // Piso 8
    { id: '801', floor: 8, type: 'Suite',         status: 'limpia', guest: null },
    { id: '802', floor: 8, type: 'Suite',         status: 'limpia', guest: null },
    { id: '803', floor: 8, type: 'Suite',         status: 'limpia', guest: null },
    { id: '804', floor: 8, type: 'Suite Palacio', status: 'limpia', guest: null },
    { id: '805', floor: 8, type: 'Suite Palacio', status: 'limpia', guest: null },
    { id: '806', floor: 8, type: 'Suite',         status: 'limpia', guest: null },
    { id: '807', floor: 8, type: 'Suite Palacio', status: 'limpia', guest: null },
  ],

  // ─── Catálogo de tipos de habitación ─────────────────────────
  roomTypes: [
    { id: 'estandar',     name: 'Estándar',      pricePerNight: 2200, features: '28 m² · Vista ciudad · Cama queen' },
    { id: 'superior',     name: 'Superior',      pricePerNight: 2900, features: '32 m² · Vista jardín · Cama king' },
    { id: 'doble-sup',    name: 'Doble Superior', pricePerNight: 3840, features: '35 m² · Vista calle · Cama king' },
    { id: 'junior-suite', name: 'Junior Suite',  pricePerNight: 5200, features: '48 m² · Vista jardín · Salón' },
    { id: 'suite',        name: 'Suite',         pricePerNight: 7400, features: '58 m² · Terraza · Jacuzzi' },
    { id: 'suite-pal',    name: 'Suite Palacio', pricePerNight: 8900, features: '68 m² · Jacuzzi · Terraza panorámica' },
  ],

  // ─── Todo lo demás arranca vacío ─────────────────────────────
  arrivals:     [],
  reservations: [],
  tickets:      [],
  tasks:        [],
  events:       [],
  customers:    [],
  comments:     [],
  requisitions: [],
  requests:     [],
  orders:       [],
  pendingOrderAlert: null,
};
