-- ═══════════════════════════════════════════════════════════════════
-- Hotel Palacio Julio · Seed data
-- ───────────────────────────────────────────────────────────────────
-- Corre esto DESPUÉS de schema.sql.
-- Es idempotente: usa ON CONFLICT para no duplicar al re-correr.
-- ═══════════════════════════════════════════════════════════════════

-- ─── Rooms ─────────────────────────────────────────────────────────
insert into public.rooms (id, floor, type, status, guest, vip_pending) values
  ('101', 1, 'Estándar',     'ocupada',  'Acevedo, F.',     null),
  ('102', 1, 'Estándar',     'limpia',   null,              null),
  ('118', 1, 'Familiar',     'ocupada',  'Familia Beltrán', null),
  ('217', 2, 'Estándar',     'ocupada',  'Acevedo, F.',     null),
  ('221', 2, 'Estándar',     'checkout', 'Reyes, S.',       null),
  ('304', 3, 'Junior Suite', 'limpia',   null,              'Mendoza'),
  ('305', 3, 'Estándar',     'sucia',    null,              null),
  ('412', 4, 'Suite',        'ocupada',  'López, J.',       null),
  ('510', 5, 'Suite',        'limpia',   null,              'Tanaka')
on conflict (id) do nothing;

-- ─── Arrivals ──────────────────────────────────────────────────────
insert into public.arrivals (id, guest, room, vip, plan, stay, time, status, status_label, done) values
  ('A-1', 'Carolina Mendoza', '304',     true,  'Doble Sup. · Desayuno americano', '3 noches · MXN 11,520', '16:30', 'warn', 'Hab. en limpieza',  false),
  ('A-2', 'Familia Beltrán',  '118 + 119', false, 'Conectadas · Pensión completa',   '4 noches · MXN 22,400', '17:00', 'ok',   'Habs listas',       false),
  ('A-3', 'Akira Tanaka',     '510',     true,  'Suite Junior · Late check-in',    '2 noches · MXN 18,600', '22:15', 'info', 'Programada',        false),
  ('A-4', 'Daniel Ortega',    '208',     false, 'Sencilla · Plan ejecutivo',       '1 noche · MXN 2,950',   '19:40', 'ok',   'Lista',             false),
  ('A-5', 'Sofia Reyes',      '221',     false, 'Doble · Solo hospedaje',          '2 noches',              '11:08', 'ok',   'En habitación',     true)
on conflict (id) do nothing;

-- ─── Requests (concierge) ──────────────────────────────────────────
insert into public.requests (id, type, icon, guest, room, vip, detail, assigned_to, sla, status, priority, urgent, created_at) values
  ('C-2304', 'Cortesía aniversario',     'star',    'Carolina Mendoza', '304', true,  'Botella espumoso · nota manuscrita · sin frutos secos', 'Diego A.',     'Antes de 16:30', 'en-progreso', 'alta',  true,  '2026-05-14T13:24:00Z'),
  ('C-2305', 'Reserva restaurante',      'coffee',  'Akira Tanaka',     '510', false, 'Cena para 2 · 21:30 · ventanas al jardín',                null,           'ASAP',           'por-asignar', 'alta',  true,  '2026-05-14T14:02:00Z'),
  ('C-2306', 'Traslado al aeropuerto',   'car',     'Familia Beltrán',  '118', false, '17 may · 06:00 · 4 pax + maletas grandes',                'Luis O.',      '17 may',         'programada',  'media', false, '2026-05-13T19:10:00Z'),
  ('C-2307', 'Servicio de equipaje',     'bag',     'Sofía Reyes',      '221', false, 'Recoger equipaje 12:00 — checkout',                       'Bell desk',    '12:00',          'programada',  'media', false, '2026-05-14T09:30:00Z'),
  ('C-2308', 'Spa · masaje deep tissue', 'sparkle', 'López, J.',        '412', false, '14 may · 11:00 · masaje 90 min · terapeuta varón',        'Spa · Carla',  '14 may',         'confirmada',  'media', false, '2026-05-13T20:05:00Z')
on conflict (id) do nothing;

-- ─── Tickets (maintenance) ─────────────────────────────────────────
insert into public.tickets (id, room, category, description, reported_by, reporter, sla, status, priority, reported_at, progress, closed_at, duration, warranty) values
  -- Activos
  ('M-217', '217',       'Plomería',     'Inodoro no descarga · hab. en uso',          'housekeeping', 'Mariana C.', '00:24',       'abierto',    'alta',  '14:08', 0,    null,             null,    false),
  ('M-304', '304',       'Plomería',     'Lavabo gotea, no urgente',                    'housekeeping', 'Mariana C.', '03:12',       'aceptado',   'media', '13:40', 20,   null,             null,    false),
  ('M-S07', '510',       'Climatización','Revisión preventiva A/C',                     'management',   null,         'hoy',         'programado', 'media', null,    0,    null,             null,    false),
  ('M-S14', 'Lobby',     'Iluminación',  '2 lámparas LED quemadas en pasillo norte',    'housekeeping', null,         'hoy',         'programado', 'baja',  null,    0,    null,             null,    false),
  ('M-S22', 'Piscina',   'Equipos',      'Filtración: cambio de cartuchos',             'management',   null,         'mañana 06:00','programado', 'baja',  null,    0,    null,             null,    false),
  -- Cerrados (historial)
  ('M-412', '412',       'Climatización','Aire acond. ruidoso',                          null,           null,         null,          'cerrado',    'media', null,    100,  'Ayer · 17:20',    '38m',   false),
  ('M-118', '118',       'Mobiliario',   'Ventana atorada',                              null,           null,         null,          'cerrado',    'baja',  null,    100,  'Ayer · 11:04',    '22m',   false),
  ('M-S03', 'Pasillo 2', 'Iluminación',  'Foco quemado x3',                              null,           null,         null,          'cerrado',    'baja',  null,    100,  '11 may · 09:14',  '14m',   false),
  ('M-505', '505',       'Electricidad', 'TV no enciende',                               null,           null,         null,          'cerrado',    'media', null,    100,  '11 may · 16:30',  '55m',   true),
  ('M-Spa', 'SPA',       'Equipos',      'Sauna · sensor temp.',                         null,           null,         null,          'cerrado',    'media', null,    100,  '10 may · 08:00',  '2h 18m',false)
on conflict (id) do nothing;

-- ─── Tasks (housekeeping) ──────────────────────────────────────────
insert into public.tasks (id, room, type, type_label, status, priority, note, sla, tags, assigned_to, progress, total, completed_at) values
  ('HK-304', '304', 'salida-vip', 'Salida → Entrada VIP', 'en-curso',    'alta',  'Llegada de Sra. Mendoza · Desayuno americano · Plus amenities aniversario', 'ETA 14:20 · 1h 12m', '{VIP,Aniversario,"Sin frutos secos"}', 'Mariana C.', 7, 12, null),
  ('HK-217', '217', 'stayover',   'Stayover',             'pendiente',   'media', null,                                                                          'Antes de 12:00',     '{"Cambio toallas",Reposición}',         null,          0, null, null),
  ('HK-412', '412', 'minibar',    'Re-stock minibar',     'pendiente',   'baja',  null,                                                                          'Hoy',                '{"Mantenim. liberó"}',                   null,          0, null, null),
  ('HK-221', '221', 'stayover',   'Stayover',             'completada',  null,    null,                                                                          null,                 '{}',                                     null,          null, null, '11:08'),
  ('HK-305', '305', 'salida',     'Salida',               'completada',  null,    null,                                                                          null,                 '{}',                                     null,          null, null, '10:42'),
  ('HK-309', '309', 'salida',     'Salida',               'completada',  null,    null,                                                                          null,                 '{}',                                     null,          null, null, '10:18'),
  ('HK-208', '208', 'llegada',    'Llegada VIP',          'completada',  null,    null,                                                                          null,                 '{}',                                     null,          null, null, '09:54')
on conflict (id) do nothing;

-- ─── Orders (kitchen) ──────────────────────────────────────────────
-- Items va como jsonb. La 304 tiene la composición completa.
insert into public.orders (id, room, guest, vip, type, meal_kind, time, time_label, status, note, allergen, allergy_text, repeat, prep_time, start_by, delivery_via, accepted_at, items) values
  ('O-304-001', '304', 'Sra. Mendoza', true,  'Desayuno americano',         'desayuno',     '07:30', '07:30 mañana', 'preparing', 'Sin frutos secos · cortesía aniversario', true,  'FRUTOS SECOS', '14, 15, 16 mayo (3 días)', '18 min', '07:12', 'Room service · Pablo', '14:32',
    '[
      {"name":"Huevos al gusto · revueltos","sub":"2 unidades · técnica suave","station":"Caliente","qty":2,"status":"cooking"},
      {"name":"Tocino crujiente","sub":"3 tiras · entreverado","station":"Caliente","qty":3,"status":"ready"},
      {"name":"Pan tostado · sin frutos secos","sub":"Bollo francés · NO masa madre nueces","station":"Panadería","qty":1,"status":"pending","allergen":true},
      {"name":"Hash browns","sub":"Acompañante","station":"Caliente","qty":1,"status":"cooking"},
      {"name":"Frutas de temporada","sub":"Sin almendras ni nueces","station":"Frío","qty":1,"status":"pending","allergen":true},
      {"name":"Café americano + jugo de naranja","sub":"Sin azúcar · 200ml","station":"Bar","qty":1,"status":"pending"}
    ]'::jsonb),
  ('O-510-002', '510', 'Sra. Vega',           false, 'Room service · brunch',    'room-service', '11:15', '11:15',        'sent',      'Aguacate doble · pan tostado',            false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-T04-003', '—',   'Mesa T-04 · Sr. Beltrán', true,  'Cena privada · terraza', 'cena',         '20:00', '20:00',        'queued',    'Menú degustación 6 tiempos',              false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-118-004', '118', 'Familia Beltrán',     false, 'Desayuno continental',      'desayuno',     '08:00', '08:00 mañana', 'queued',    null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-201-005', '201', 'Carrasco',            false, 'Continental',               'desayuno',     '07:00', null,           'ready',     null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-208-006', '208', 'Ortega',              false, 'Americano',                 'desayuno',     '07:00', null,           'ready',     null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-305-007', '305', 'Schwartz',            false, 'Continental · café descaf.','desayuno',     '07:30', null,           'preparing', null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-221-008', '221', 'Reyes',               false, 'Vegano',                    'desayuno',     '07:30', null,           'preparing', null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-119-009', '119', 'Beltrán (×2)',        false, 'Americano',                 'desayuno',     '08:00', null,           'queued',    null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-402-010', '402', 'Liu',                 false, 'Sin gluten',                'desayuno',     '08:00', null,           'queued',    null,                                       true,  null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-510-011', '510', 'Tanaka',              false, 'Continental + tarde',       'desayuno',     '08:30', null,           'queued',    null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb),
  ('O-412-012', '412', 'López',               false, 'Americano',                 'desayuno',     '08:30', null,           'queued',    null,                                       false, null,            null,                       null,     null,    null,                   null,    '[]'::jsonb)
on conflict (id) do nothing;

-- ─── Reservations ──────────────────────────────────────────────────
insert into public.reservations (id, guest_name, customer_id, channel, stay, check_in, check_out, nights, room, room_type, plan, amount, status, vip, is_group, today) values
  ('R-9120', 'Carolina Mendoza',                     'CUST-001', 'Club Julio · Directa',         '13–16 may · 3n',     '13 may', '16 may', 3, '304',     'Doble Superior',     'Desayuno americano',          11520, 'confirmada',    true,  false, true),
  ('R-9122', 'Familia Beltrán',                       null,       'Booking.com',                  '13–17 may · 4n',     '13 may', '17 may', 4, '118+119', 'Doble Sup. (×2)',    'Pensión completa · 2 habs',   22400, 'confirmada',    false, false, true),
  ('R-9121', 'Akira Tanaka',                          'CUST-002', 'Expedia',                      '13–15 may · 2n',     '13 may', '15 may', 2, '510',     'Suite Junior',       'Solo hospedaje',              18600, 'por-confirmar', true,  false, true),
  ('R-9180', 'Cong. Médico AMG · Dr. Iván Solís',     null,       'Grupo · contacto Dr. Solís',   '20–22 may · 32 hab.','20 may', '22 may', 2, '—',       'Bloqueo 32 hab',     'Bloqueo + coffee breaks',     248000,'seguimiento',   false, true,  false)
on conflict (id) do nothing;

-- ─── Room types ────────────────────────────────────────────────────
insert into public.room_types (id, name, price_per_night, features) values
  ('doble-sup',    'Doble Superior', 3840, '35 m² · Vista calle · Cama king'),
  ('junior-suite', 'Suite Junior',   5200, '48 m² · Vista jardín · Salón'),
  ('suite-pal',    'Suite Palacio',  8900, '68 m² · Jacuzzi · Terraza')
on conflict (id) do nothing;

-- ─── Customers ─────────────────────────────────────────────────────
insert into public.customers (id, name, tier, vip, since, stays, lifetime_revenue, nps, contact, insights, previous_stays) values
  ('CUST-001', 'Carolina Mendoza', 'oro',   true, 2022, 5, 182000, 9.4, '+52 55 8421 0033 · WhatsApp',
    '[
      {"icon":"coffee","text":"Pide café americano sin azúcar"},
      {"icon":"flame","text":"Alérgica a frutos secos","tone":"danger"},
      {"icon":"bed","text":"Almohadas firmes · cama doble"},
      {"icon":"star","text":"Aniversario el 14 de mayo","tone":"brass"}
    ]'::jsonb,
    '[
      {"date":"Nov 2025","room":"412","rating":"9","plan":"Med. pensión"},
      {"date":"May 2025","room":"304","rating":"10","plan":"Desayuno · aniv."},
      {"date":"Sep 2024","room":"221","rating":"9","plan":"Solo hosp."}
    ]'::jsonb),
  ('CUST-002', 'Akira Tanaka', 'plata', true, 2024, 2, 36000, 9.0, 'a.tanaka@example.jp',
    '[
      {"icon":"flame","text":"Alergia mariscos (esposa)","tone":"danger"},
      {"icon":"coffee","text":"Sake japonés preferido"}
    ]'::jsonb,
    '[
      {"date":"Mar 2024","room":"510","rating":"9","plan":"Solo hosp."}
    ]'::jsonb)
on conflict (id) do nothing;

-- ─── Pending order alert (singleton) ───────────────────────────────
insert into public.pending_order_alert (id, alert) values
  ('singleton',
    '{
      "from":"reception",
      "room":"304",
      "guest":"Sra. Mendoza",
      "summary":"3 desayunos americanos",
      "dates":"13–15 may · 7:30",
      "allergyText":"ALERGIA frutos secos"
    }'::jsonb)
on conflict (id) do update set alert = excluded.alert;

-- ─── Events (Ordenes de Evento) ────────────────────────────────────
insert into public.events (id, name, date, time, salon, pax, client, created_by, menu, allergens, notes, status, acks) values
  ('EVT-001', 'Cena de gala · Congreso AMG',   '2026-05-20', '20:00', 'Salón Palacio',    80, 'Dr. Iván Solís',    'sales',
    'Menú degustación 4 tiempos · maridaje incluido',
    'Frutos secos en postre (confirmar con chef)',
    'Mesa de honor 10pax · discurso 20:45 · música en vivo 21:30',
    'confirmado',
    '{"housekeeping":"2026-05-14T09:12:00","maintenance":null,"reception":"2026-05-14T10:05:00","purchasing":null}'::jsonb),
  ('EVT-002', 'Desayuno ejecutivo · Grupo AMG', '2026-05-21', '08:00', 'Sala Chapultepec', 18, 'Dr. Iván Solís',    'sales',
    'Buffet continental · estación de café',
    null,
    'Proyector + pantalla · presentación a las 08:30',
    'confirmado',
    '{"housekeeping":"2026-05-14T11:30:00","maintenance":"2026-05-14T11:45:00","reception":null,"purchasing":"2026-05-14T12:00:00"}'::jsonb),
  ('EVT-003', 'Cóctel de bienvenida',           '2026-05-20', '18:00', 'Terraza Principal', 35, 'Dr. Iván Solís',   'sales',
    'Bocadillos variados · barra libre 2h',
    null,
    'Setup: 60 min antes · sillas tipo coctel · iluminación cálida',
    'borrador',
    '{"housekeeping":null,"maintenance":null,"reception":null,"purchasing":null}'::jsonb)
on conflict (id) do nothing;

-- ─── Comments ──────────────────────────────────────────────────────
insert into public.comments (entity_type, entity_id, author, role, body, created_at) values
  ('ticket',  'M-217',   'Mariana C.',     'housekeeping', 'Confirmo: inodoro sin descarga. Hab en uso — huésped avisado de la demora.',                           '2026-05-14T14:10:00Z'),
  ('ticket',  'M-217',   'Roberto V.',     'maintenance',  'En camino con refacciones. ETA 20 min.',                                                                '2026-05-14T14:28:00Z'),
  ('event',   'EVT-001', 'Ana Torres',     'sales',        'Confirmado con el cliente: menú cerrado, 80 pax fijos. Sin cambios de última hora.',                   '2026-05-14T09:00:00Z'),
  ('event',   'EVT-001', 'Lucía Ramírez',  'reception',    'Checkeado con reservas. El bloqueo de habitaciones del grupo ya está cargado en el sistema.',          '2026-05-14T10:05:00Z')
on conflict do nothing;

-- ─── Requisitions ──────────────────────────────────────────────────
insert into public.requisitions (id, area, item, qty, requested_by, status, created_at, updated_at) values
  ('REQ-001', 'maintenance',  'Cinta de teflón 1/2 plg (rollo x10)',          5,  'Roberto V.',   'surtido',   '2026-05-12T08:00:00Z', '2026-05-13T10:00:00Z'),
  ('REQ-002', 'housekeeping', 'Bolsas de basura negras 60L (caja x100)',       3,  'Mariana C.',   'surtido',   '2026-05-12T09:30:00Z', '2026-05-13T11:00:00Z'),
  ('REQ-003', 'maintenance',  'Foco LED GU10 6W (pack x12)',                   2,  'Roberto V.',   'en-camino', '2026-05-14T07:45:00Z', '2026-05-14T09:00:00Z'),
  ('REQ-004', 'housekeeping', 'Amenities set (champú + acondicionador) x200',  4,  'Mariana C.',   'pedido',    '2026-05-14T13:20:00Z', '2026-05-14T13:20:00Z')
on conflict (id) do nothing;
