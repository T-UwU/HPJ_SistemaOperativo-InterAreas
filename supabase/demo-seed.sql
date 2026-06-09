-- ═══════════════════════════════════════════════════════════════════
-- Hotel Palacio Julio · Datos de demostración para el cliente
-- ───────────────────────────────────────────────────────────────────
-- Borra los datos operativos y carga un conjunto coherente para mostrar
-- todas las áreas funcionando: tareas, incidencias, tickets, eventos,
-- pedidos, actividad, chat y comentarios.
--
-- NO toca los usuarios (auth.users ni profiles). Asegúrate de haber creado
-- antes los usuarios (npm run seed:users o desde el panel).
--
-- USO: pega este archivo completo en el SQL Editor de Supabase y "Run".
-- Es idempotente: puede correrse varias veces (vuelve a dejar el mismo set).
-- ═══════════════════════════════════════════════════════════════════


-- ── 0 · Asegurar columnas que usa la aplicación ─────────────────────
-- (por si la base se creó antes de estas funciones)

-- Tickets: acuses y fotos
alter table public.tickets add column if not exists acks   jsonb default '{}'::jsonb;
alter table public.tickets add column if not exists photos jsonb default '[]'::jsonb;

-- Requisiciones: notas, prioridad y categoría
alter table public.requisitions add column if not exists notes    text;
alter table public.requisitions add column if not exists priority text default 'normal';
alter table public.requisitions add column if not exists category text;

-- Requisiciones: permitir el estado 'completado' (recibido)
alter table public.requisitions drop constraint if exists requisitions_status_check;
alter table public.requisitions
  add constraint requisitions_status_check
  check (status in ('pedido', 'en-camino', 'surtido', 'completado'));


-- ── 1 · Vaciar tablas operativas (no toca usuarios) ─────────────────
truncate table public.activity     restart identity cascade;
truncate table public.comments     restart identity cascade;
truncate table public.messages                      cascade;
truncate table public.rooms                         cascade;
truncate table public.arrivals                      cascade;
truncate table public.tickets                       cascade;
truncate table public.tasks                         cascade;
truncate table public.reservations                  cascade;
truncate table public.orders                        cascade;
truncate table public.requests                      cascade;
truncate table public.room_types                    cascade;
truncate table public.customers                     cascade;
truncate table public.events                        cascade;
truncate table public.requisitions                  cascade;
truncate table public.pending_order_alert           cascade;


-- ── 2 · Habitaciones ────────────────────────────────────────────────
insert into public.rooms (id, floor, type, status, guest) values
  ('101', 1, 'Doble',  'limpia',    null),
  ('102', 1, 'King',   'sucia',     null),
  ('204', 2, 'King',   'bloqueada', null),
  ('305', 3, 'Suite',  'limpia',    null),
  ('410', 4, 'Doble',  'ocupada',   'Familia Herrera'),
  ('507', 5, 'Junior', 'limpia',    null);


-- ── 3 · Tareas de limpieza ──────────────────────────────────────────
insert into public.tasks
  (id, room, type, type_label, status, priority, note, sla, tags, assigned_to, progress, total, completed_at) values
  ('HK-2001', '204',          'general',      'Limpieza general', 'pendiente',  'alta',  null,                              'Antes de 12:00', '{}'::text[],                    null,            0,   5,   null),
  ('HK-2002', '102',          'profunda',     'Limpieza profunda','en-curso',   'media', 'Tras salida del huésped',         'Antes de 14:00', '{}'::text[],                    'Mariana Cruz',  2,   7,   null),
  ('HK-2003', 'Salón Jardín', 'post-evento',  'Post-evento',      'pendiente',  'media', 'Después del evento corporativo',  'Antes de 14:00', ARRAY['Sin frutos secos'],       null,            0,   7,   null),
  ('HK-2004', '305',          'general',      'Limpieza general', 'completada', 'baja',  null,                              'Sin urgencia',   '{}'::text[],                    'Mariana Cruz',  100, 5,   '09:40'),
  ('HK-2005', '410',          'reposicion',   'Reposición',       'pendiente',  'baja',  'Reponer amenities y minibar',     'Sin urgencia',   '{}'::text[],                    null,            0,   5,   null),
  ('HK-2006', 'Spa',          'sanitizacion', 'Sanitización',     'completada', 'media', null,                              'Antes de 10:00', '{}'::text[],                    'Mariana Cruz',  100, 5,   '08:20');


-- ── 4 · Tickets de mantenimiento ────────────────────────────────────
-- reported_by: housekeeping o maintenance. status: abierto/aceptado/cerrado/programado.
insert into public.tickets
  (id, room, category, description, reported_by, reporter, sla, status, priority, reported_at, progress, closed_at, duration, warranty, acks, photos) values
  ('TCK-1001', '204',            'Clima',       'No enfría el aire acondicionado, la habitación está muy caliente', 'housekeeping', 'Mariana Cruz',   '01:00', 'abierto',    'alta',  '09:15', 0,  null,                          null,    false, '{}'::jsonb, '[]'::jsonb),
  ('TCK-1002', '102',            'Plomería',    'Fuga constante bajo el lavabo, el piso está mojado',              'housekeeping', 'Mariana Cruz',   '04:00', 'aceptado',   'media', '08:50', 40, null,                          null,    false, jsonb_build_object('maintenance', (now() - interval '2 hours')::text), '[]'::jsonb),
  ('TCK-1003', 'Salón Jardín',   'Electricidad','Foco fundido en el candil principal',                             'maintenance',  'Eduardo Galindo','24:00', 'cerrado',    'baja',  'Ayer',  100,(now() - interval '1 hour')::text,  '00:45', false, jsonb_build_object('maintenance', (now() - interval '5 hours')::text), '[]'::jsonb),
  ('TCK-1004', 'Área de alberca','Mobiliario',  'Camastro con respaldo roto, representa un riesgo para huéspedes', 'housekeeping', 'Mariana Cruz',   '04:00', 'abierto',    'media', '10:05', 0,  null,                          null,    false, '{}'::jsonb, '[]'::jsonb),
  ('TCK-1005', '305',            'Plomería',    'Poca presión de agua en la regadera',                             'maintenance',  'Eduardo Galindo','24:00', 'cerrado',    'baja',  'Ayer',  100,(now() - interval '6 hours')::text, '01:10', false, jsonb_build_object('maintenance', (now() - interval '8 hours')::text), '[]'::jsonb),
  ('TCK-1006', 'Lobby principal','Electricidad','Contacto sin energía cerca del mostrador de recepción',           'maintenance',  'Eduardo Galindo','04:00', 'programado', 'media', '11:00', 0,  null,                          null,    false, '{}'::jsonb, '[]'::jsonb);


-- ── 5 · Eventos (próximos) ──────────────────────────────────────────
-- acks: objeto con la hora de confirmación de cada área. Áreas ausentes = pendientes.
insert into public.events
  (id, name, date, time, salon, pax, client, created_by, menu, allergens, notes, status, acks) values
  ('EV-3001', 'Boda Martínez Soto',     current_date + 5,  '17:00', 'Salón Palacio',     180, 'Familia Martínez',     'sales', 'Menú tres tiempos premium',     'Sin frutos secos',  'Montaje tipo banquete, pista de baile al centro', 'confirmado',
     jsonb_build_object('reception', (now() - interval '5 hours')::text, 'housekeeping', (now() - interval '4 hours')::text, 'maintenance', (now() - interval '3 hours')::text, 'purchasing', (now() - interval '2 hours')::text)),
  ('EV-3002', 'XV Años Valentina',      current_date + 12, '19:00', 'Terraza Principal', 120, 'Sra. Gómez',           'sales', 'Menú de gala',                  'Ninguno',           'Vals a las 20:00, cañón de luces y humo bajo',    'confirmado',
     jsonb_build_object('reception', (now() - interval '3 hours')::text, 'housekeeping', (now() - interval '2 hours')::text)),
  ('EV-3003', 'Congreso Farmacéutico',  current_date + 18, '09:00', 'Sala Ejecutiva',    60,  'Laboratorios Vida',    'sales', 'Coffee break y comida ejecutiva','Opciones veganas',  'Montaje tipo auditorio, proyector y pódium',      'borrador',
     '{}'::jsonb),
  ('EV-3004', 'Cena Aniversario Reyes', current_date + 25, '20:00', 'Sala Chapultepec',  40,  'Sr. y Sra. Reyes',     'sales', 'Cena maridaje',                 'Sin mariscos',      'Mesa imperial, música en vivo',                   'borrador',
     jsonb_build_object('reception', (now() - interval '1 hour')::text));


-- ── 6 · Requisiciones (pedidos) ─────────────────────────────────────
-- area: maintenance / housekeeping / reception / sales
-- priority: urgente / normal / puede-esperar · category: insumo/material/herramienta/servicio/otro
-- status: pedido / en-camino / surtido / completado
insert into public.requisitions
  (id, area, item, qty, requested_by, status, notes, priority, category) values
  ('RQ-4001', 'maintenance',  'Focos LED 9W',                 6,  'Eduardo Galindo',   'surtido',   'Para el candil del Salón Jardín',   'normal',        'material'),
  ('RQ-4002', 'maintenance',  'Sellador de silicón',          3,  'Eduardo Galindo',   'en-camino', null,                                'normal',        'insumo'),
  ('RQ-4003', 'maintenance',  'Llave de paso de 1/2 pulgada', 2,  'Eduardo Galindo',   'pedido',    'Urgente para la fuga de la Hab 102','urgente',       'material'),
  ('RQ-4004', 'housekeeping', 'Bolsas de basura industriales',50, 'Mariana Cruz',      'pedido',    null,                                'normal',        'insumo'),
  ('RQ-4005', 'housekeeping', 'Desinfectante multiusos',      12, 'Mariana Cruz',      'surtido',   null,                                'normal',        'insumo'),
  ('RQ-4006', 'reception',    'Tóner para impresora',         2,  'Lucía Ramírez',     'en-camino', 'Modelo de la impresora del lobby',  'puede-esperar', 'insumo'),
  ('RQ-4007', 'sales',        'Carpetas de presentación',     30, 'Patricia Salinas',  'pedido',    'Para juntas con clientes',          'puede-esperar', 'material');


-- ── 7 · Actividad (notificaciones y tablero de Recepción) ───────────
-- Las incidencias (action con la palabra "Incidencia") se clasifican en Recepción:
--   activas = su ticket aún no está cerrado · resueltas = su ticket está cerrado.
insert into public.activity (role, actor, action, room, ref_id, created_at) values
  ('housekeeping', 'Mariana Cruz',     'Incidencia alta: Clima, no enfría el aire',            '204',            'TCK-1001', now() - interval '12 minutes'),
  ('housekeeping', 'Mariana Cruz',     'Incidencia media: Mobiliario, camastro roto',          'Área de alberca','TCK-1004', now() - interval '40 minutes'),
  ('housekeeping', 'Mariana Cruz',     'Incidencia media: Plomería, fuga bajo el lavabo',      '102',            'TCK-1002', now() - interval '1 hour'),
  ('maintenance',  'Eduardo Galindo',  'Ticket cerrado: Foco fundido en el candil principal',  'Salón Jardín',   'TCK-1003', now() - interval '55 minutes'),
  ('maintenance',  'Eduardo Galindo',  'Incidencia baja: Electricidad, foco fundido',          'Salón Jardín',   'TCK-1003', now() - interval '3 hours'),
  ('maintenance',  'Eduardo Galindo',  'Ticket cerrado: Poca presión de agua en la regadera',  '305',            'TCK-1005', now() - interval '5 hours'),
  ('sales',        'Patricia Salinas', 'Evento creado: Boda Martínez Soto',                    'Salón Palacio',  'EV-3001',  now() - interval '5 hours'),
  ('reception',    'Lucía Ramírez',    'Acuse recibido: Boda Martínez Soto',                   'Salón Palacio',  'EV-3001',  now() - interval '4 hours'),
  ('housekeeping', 'Mariana Cruz',     'Hab lista: Limpieza general',                          '305',            null,       now() - interval '2 hours'),
  ('purchasing',   'Roberto Fuentes',  'Pedido surtido: Focos LED 9W',                         null,             'RQ-4001',  now() - interval '90 minutes'),
  ('sales',        'Patricia Salinas', 'Evento creado: XV Años Valentina',                     'Terraza Principal','EV-3002',now() - interval '6 hours'),
  ('housekeeping', 'Mariana Cruz',     'Tarea asignada: Post-evento en Salón Jardín',          'Salón Jardín',   'HK-2003',  now() - interval '3 hours');


-- ── 8 · Chat entre áreas ────────────────────────────────────────────
insert into public.messages (from_role, from_name, body, created_at) values
  ('maintenance',  'Eduardo Galindo',  'Buen día equipo, ya estoy atendiendo la fuga de la 102.',                       now() - interval '70 minutes'),
  ('housekeeping', 'Mariana Cruz',     'Gracias Eduardo. La 204 sigue caliente, el huésped llega a las 3.',             now() - interval '60 minutes'),
  ('maintenance',  'Eduardo Galindo',  'Voy a la 204 en cuanto cierre la 102.',                                         now() - interval '55 minutes'),
  ('sales',        'Patricia Salinas', 'Recordatorio: la boda Martínez es este fin, 180 personas en Salón Palacio.',    now() - interval '45 minutes'),
  ('reception',    'Lucía Ramírez',    'Enterada, ya confirmé el acuse. ¿Compras tiene listo el material?',             now() - interval '30 minutes'),
  ('purchasing',   'Roberto Fuentes',  'Los focos ya están surtidos, paso a dejarlos a mantenimiento.',                 now() - interval '20 minutes');


-- ── 9 · Comentarios contextuales (en tickets y eventos) ─────────────
insert into public.comments (entity_type, entity_id, author, role, body, created_at) values
  ('ticket', 'TCK-1002', 'Eduardo Galindo',  'maintenance',  'Cerré la llave de paso, estoy cambiando el empaque del lavabo.', now() - interval '40 minutes'),
  ('ticket', 'TCK-1001', 'Lucía Ramírez',    'reception',    'El huésped de la 204 llega a las 15:00, ¿alcanza a quedar?',     now() - interval '25 minutes'),
  ('event',  'EV-3001',  'Mariana Cruz',     'housekeeping', 'Confirmamos el montaje del salón un día antes.',                now() - interval '3 hours'),
  ('event',  'EV-3001',  'Roberto Fuentes',  'purchasing',   'Mantelería y cristalería ya apartadas.',                        now() - interval '2 hours');


-- ═══════════════════════════════════════════════════════════════════
-- Listo. Abre la app, inicia sesión con cualquier usuario y recorre las
-- áreas. Si quieres un estado totalmente limpio otra vez, vuelve a correr
-- este archivo.
-- ═══════════════════════════════════════════════════════════════════
