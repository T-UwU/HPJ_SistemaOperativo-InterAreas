// src/store/data.js — estado operativo del hotel.
//
// Online:  Supabase como fuente de verdad + suscripciones Realtime.
//          Las mutaciones actualizan Zustand de inmediato (optimistic)
//          y sincronizan a Supabase en segundo plano.
// Offline: Zustand persist → localStorage (igual que antes).
//
// La API pública (selectores + useActions) no cambia — las pantallas
// no necesitan modificarse.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seed } from './seed';
import { useActivity } from './activity.js';
import { supabase, isOnlineMode } from '../lib/supabase.js';

// ── Util ──────────────────────────────────────────────────────────────
const upsert = (list, id, patch) =>
  list.map((it) => (it.id === id ? { ...it, ...patch } : it));

const logActivity = (role, actor, action, room, refId) =>
  useActivity.getState().log(role, actor, action, room, refId);

// Fire-and-forget: sincroniza a Supabase sin bloquear la UI
const sync = (fn) => {
  if (!isOnlineMode) return;
  Promise.resolve(fn()).catch((e) => console.error('[sync]', e));
};

// ── Mappers Supabase (snake_case) → Zustand (camelCase) ───────────────
const fromRoom     = ({ vip_pending, updated_at, ...r }) =>
  ({ ...r, vipPending: vip_pending });

const fromTask     = ({ type_label, assigned_to, completed_at, created_at, ...r }) =>
  ({ ...r, typeLabel: type_label, assignedTo: assigned_to, completedAt: completed_at });

const fromTicket   = ({ description, reported_by, reported_at, closed_at, created_at, ...r }) =>
  ({ ...r, desc: description, reportedBy: reported_by, reportedAt: reported_at,
     closedAt: closed_at, acks: r.acks || { maintenance: null } });

const fromArrival  = ({ status_label, updated_at, ...r }) =>
  ({ ...r, statusLabel: status_label });

const fromRes      = ({ guest_name, customer_id, check_in, check_out, room_type, is_group, created_at, ...r }) =>
  ({ ...r, guestName: guest_name, customerId: customer_id, checkIn: check_in,
     checkOut: check_out, roomType: room_type, group: is_group });

const fromEvent    = ({ created_by, created_at, updated_at, ...r }) =>
  ({ ...r, createdBy: created_by });

const fromReq      = ({ requested_by, created_at, updated_at, ...r }) =>
  ({ ...r, requestedBy: requested_by, createdAt: created_at, updatedAt: updated_at });

const fromComment  = ({ entity_type, entity_id, created_at, ...r }) =>
  ({ ...r, entityType: entity_type, entityId: entity_id, at: created_at });

const fromRoomType = ({ price_per_night, ...r }) =>
  ({ ...r, pricePerNight: price_per_night });

const fromCustomer = ({ lifetime_revenue, previous_stays, ...r }) =>
  ({ ...r, lifetimeRevenue: lifetime_revenue, previousStays: previous_stays });

// ── Mappers Zustand (camelCase) → Supabase (snake_case) ───────────────
const toRoom = (r) => ({
  id: r.id, floor: r.floor, type: r.type, status: r.status,
  guest: r.guest || null, vip_pending: r.vipPending || null,
});

const toTask = (t) => ({
  id: t.id, room: t.room, type: t.type,
  type_label: t.typeLabel || null, status: t.status,
  priority: t.priority || 'media', note: t.note || null, sla: t.sla || null,
  tags: t.tags || [], assigned_to: t.assignedTo || null,
  progress: t.progress || 0, total: t.total || null,
  completed_at: t.completedAt || null,
});

const toTicket = (t) => ({
  id: t.id, room: t.room, category: t.category,
  description: t.desc, reported_by: t.reportedBy || null,
  reporter: t.reporter || null, sla: t.sla || null,
  status: t.status, priority: t.priority || 'media',
  reported_at: t.reportedAt || null, progress: t.progress || 0,
  closed_at: t.closedAt || null, duration: t.duration || null,
  warranty: t.warranty || false, acks: t.acks || {},
  photos: t.photos || [],
});

const toArrival = (a) => ({
  id: a.id, guest: a.guest, room: a.room,
  vip: a.vip || false, plan: a.plan || null, stay: a.stay || null,
  time: a.time || null, status: a.status || null,
  status_label: a.statusLabel || null, done: a.done || false,
});

const toRes = (r) => ({
  id: r.id, guest_name: r.guestName, customer_id: r.customerId || null,
  channel: r.channel || null, stay: r.stay || null,
  check_in: r.checkIn || null, check_out: r.checkOut || null,
  nights: r.nights || null, room: r.room || null,
  room_type: r.roomType || null, plan: r.plan || null,
  amount: r.amount || 0, status: r.status, vip: r.vip || false,
  is_group: r.group || false, today: r.today || false,
});

const toEvent = (e) => ({
  id: e.id, name: e.name,
  date: e.date || new Date().toISOString().split('T')[0],
  time: e.time, salon: e.salon, pax: e.pax || 0,
  client: e.client || null, created_by: e.createdBy || 'sales',
  menu: e.menu || null, allergens: e.allergens || null,
  notes: e.notes || null, status: e.status || 'borrador',
  acks: e.acks || {},
});

const toReq = (r) => ({
  id: r.id, area: r.area, item: r.item,
  qty: r.qty || 1, requested_by: r.requestedBy,
  notes: r.notes || null,
  priority: r.priority || 'normal',
  category: r.category || null,
  status: ['pedido', 'en-camino', 'surtido', 'completado'].includes(r.status)
    ? r.status : 'pedido',
});

// ── Realtime ──────────────────────────────────────────────────────────
let _channel = null;

function setupRealtime(set) {
  if (!isOnlineMode || !supabase || _channel) return;

  const on = (fromFn, key) => ({ eventType, new: row, old }) => {
    if (eventType === 'DELETE') {
      set((s) => ({ [key]: s[key].filter((it) => it.id !== old.id) }));
    } else {
      const item = fromFn(row);
      set((s) => {
        const local = s[key].find((it) => it.id === item.id);
        if (local) {
          // Preservar campos local-only: acks en tickets, estado completado en requisiciones
          const preserve = {};
          if (local.acks && key === 'tickets') preserve.acks = local.acks;
          if (local.status === 'completado' && key === 'requisitions') return s;
          return { [key]: upsert(s[key], item.id, { ...item, ...preserve }) };
        }
        return { [key]: [item, ...s[key]] };
      });
    }
  };

  _channel = supabase.channel('hpj-operational')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' },        on(fromRoom,    'rooms'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },        on(fromTask,    'tasks'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' },      on(fromTicket,  'tickets'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'arrivals' },     on(fromArrival, 'arrivals'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, on(fromRes,     'reservations'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' },       on(fromEvent,   'events'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'requisitions' }, on(fromReq,     'requisitions'))
    .subscribe();
}

// ── Store ─────────────────────────────────────────────────────────────
export const useData = create(
  persist(
    (set, get) => ({
      ...seed,
      _hydrated: false,

      actions: {

        // ── Bootstrap ─────────────────────────────────────────────────
        hydrate: async () => {
          if (!isOnlineMode || !supabase) return;
          if (get()._hydrated) return;

          // Espera a que la sesión esté restaurada antes de consultar.
          // Sin sesión las tablas (con RLS) devuelven vacío; en ese caso
          // no marcamos _hydrated para reintentar al iniciar sesión.
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          try {
            const [
              { data: rooms },
              { data: tasks },
              { data: tickets },
              { data: arrivals },
              { data: reservations },
              { data: events },
              { data: requisitions },
              { data: comments },
              { data: roomTypes },
              { data: customers },
            ] = await Promise.all([
              supabase.from('rooms').select('*').order('id'),
              supabase.from('tasks').select('*').order('created_at', { ascending: false }),
              supabase.from('tickets').select('*').order('created_at', { ascending: false }),
              supabase.from('arrivals').select('*').order('updated_at', { ascending: false }),
              supabase.from('reservations').select('*').order('created_at', { ascending: false }),
              supabase.from('events').select('*').order('created_at', { ascending: false }),
              supabase.from('requisitions').select('*').order('created_at', { ascending: false }),
              supabase.from('comments').select('*').order('created_at', { ascending: true }),
              supabase.from('room_types').select('*'),
              supabase.from('customers').select('*'),
            ]);

            set({
              _hydrated: true,
              // rooms y roomTypes: caer al seed si Supabase devuelve vacío (tabla no poblada)
              ...(rooms?.length     > 0 && { rooms:        rooms.map(fromRoom) }),
              ...(roomTypes?.length > 0 && { roomTypes:    roomTypes.map(fromRoomType) }),
              // el resto sí puede ser vacío legítimamente
              ...(tasks        && { tasks:        tasks.map(fromTask) }),
              ...(tickets      && { tickets:      tickets.map(fromTicket) }),
              ...(arrivals     && { arrivals:     arrivals.map(fromArrival) }),
              ...(reservations && { reservations: reservations.map(fromRes) }),
              ...(events       && { events:       events.map(fromEvent) }),
              ...(requisitions && { requisitions: requisitions.map(fromReq) }),
              ...(comments     && { comments:     comments.map(fromComment) }),
              ...(customers    && { customers:    customers.map(fromCustomer) }),
            });

            setupRealtime(set);
          } catch (err) {
            console.error('[hydrate]', err);
            set({ _hydrated: true }); // igual marca como hydrated para no reintentar en loop
            setupRealtime(set);
          }
        },

        // ── Tickets (mantenimiento) ───────────────────────────────────
        addTicket: (t) => {
          const id = `M-${Date.now()}`;
          const ticket = { id, acks: { maintenance: null }, ...t };
          set((s) => ({ tickets: [ticket, ...s.tickets] }));
          sync(() => supabase.from('tickets').insert(toTicket(ticket)));
          // Notificar al área que reportó
          logActivity(
            t.reportedBy || 'maintenance', t.reporter || '—',
            `Incidencia ${t.priority === 'alta' ? '⚠ ALTA' : t.priority || ''}: ${t.category} — ${t.desc || 'Sin descripción'}`,
            t.room, ticket.id
          );
          // Si Recepción debe ser notificada explícitamente (ej: desde Report.jsx)
          if (t.notifyReception) {
            logActivity(
              'reception', t.reporter || '—',
              `Incidencia reportada en ${t.room}: ${t.category} · ${t.desc || 'Sin descripción'}`,
              t.room, ticket.id
            );
          }
        },
        acceptTicket: (id) => {
          set((s) => ({ tickets: upsert(s.tickets, id, { status: 'aceptado', progress: 0 }) }));
          sync(() => supabase.from('tickets').update({ status: 'aceptado', progress: 0 }).eq('id', id));
        },
        progressTicket: (id, progress) => {
          set((s) => ({ tickets: upsert(s.tickets, id, { progress }) }));
          sync(() => supabase.from('tickets').update({ progress }).eq('id', id));
        },
        closeTicket: (id) => {
          const ticket = get().tickets.find((t) => t.id === id);
          const closedAt = new Date().toISOString();
          set((s) => ({ tickets: upsert(s.tickets, id, { status: 'cerrado', closedAt }) }));
          sync(() => supabase.from('tickets').update({ status: 'cerrado', closed_at: closedAt }).eq('id', id));
          if (ticket?.room) {
            const room = get().rooms.find((r) => r.id === ticket.room);
            if (room?.status === 'bloqueada') {
              set((s) => ({ rooms: upsert(s.rooms, ticket.room, { status: 'limpia' }) }));
              sync(() => supabase.from('rooms').update({ status: 'limpia' }).eq('id', ticket.room));
            }
          }
          logActivity('maintenance', '—', `Ticket cerrado: ${ticket?.desc || id}`, ticket?.room, id);
        },
        pauseTicket: (id) => {
          set((s) => ({ tickets: upsert(s.tickets, id, { status: 'abierto', progress: 0 }) }));
          sync(() => supabase.from('tickets').update({ status: 'abierto', progress: 0 }).eq('id', id));
        },
        ackTicket: (id, role) => {
          const at = new Date().toISOString();
          set((s) => ({
            tickets: s.tickets.map((t) => {
              if (t.id !== id) return t;
              return { ...t, acks: { ...(t.acks || {}), [role]: at } };
            }),
          }));
          const updatedAcks = { ...(get().tickets.find((t) => t.id === id)?.acks || {}), [role]: at };
          sync(() => supabase.from('tickets').update({ acks: updatedAcks }).eq('id', id));
        },

        // ── Tareas (limpieza) ─────────────────────────────────────────
        addTask: (t) => {
          const id = `HK-${Date.now()}`;
          const task = {
            id, status: 'pendiente', priority: 'media',
            progress: 0, tags: [], assignedTo: null,
            total: null, completedAt: null, ...t,
          };
          set((s) => ({ tasks: [task, ...s.tasks] }));
          sync(() => supabase.from('tasks').insert(toTask(task)));
          logActivity('housekeeping', t.createdBy || 'Limpieza',
            `Tarea asignada: ${t.typeLabel || t.type} · Hab ${t.room}`, t.room, id);
        },
        startTask: (id, assignedTo) => {
          set((s) => ({ tasks: upsert(s.tasks, id, { status: 'en-curso', assignedTo, progress: 0 }) }));
          sync(() => supabase.from('tasks').update({ status: 'en-curso', assigned_to: assignedTo, progress: 0 }).eq('id', id));
        },
        progressTask: (id, progress) => {
          set((s) => ({ tasks: upsert(s.tasks, id, { progress }) }));
          sync(() => supabase.from('tasks').update({ progress }).eq('id', id));
        },
        pauseTask: (id) => {
          set((s) => ({ tasks: upsert(s.tasks, id, { status: 'pendiente', progress: 0, assignedTo: null }) }));
          sync(() => supabase.from('tasks').update({ status: 'pendiente', progress: 0, assigned_to: null }).eq('id', id));
        },
        completeTask: (id) => {
          const task = get().tasks.find((t) => t.id === id);
          set((s) => ({ tasks: upsert(s.tasks, id, { status: 'completada', progress: 100 }) }));
          sync(() => supabase.from('tasks').update({ status: 'completada', progress: 100 }).eq('id', id));
          if (task?.room) {
            const room = get().rooms.find((r) => r.id === task.room);
            if (room?.status === 'sucia') {
              set((s) => ({ rooms: upsert(s.rooms, task.room, { status: 'limpia' }) }));
              sync(() => supabase.from('rooms').update({ status: 'limpia' }).eq('id', task.room));
            }
          }
          logActivity('housekeeping', task?.assignedTo || 'Limpieza',
            `Hab lista: ${task?.typeLabel || task?.type || 'Tarea'}`, task?.room, id);
        },

        // ── Habitaciones ──────────────────────────────────────────────
        setRoomStatus: (id, status) => {
          set((s) => ({ rooms: upsert(s.rooms, id, { status }) }));
          sync(() => supabase.from('rooms').update({ status }).eq('id', id));
        },

        checkOut: (roomId, guestName) => {
          // Buscar el arrival antes de modificar el estado
          const arrival = get().arrivals.find((a) => a.room?.split(' ')[0] === roomId);

          set((s) => ({
            rooms:    upsert(s.rooms, roomId, { status: 'sucia', guest: null }),
            arrivals: s.arrivals.filter((a) => a.room?.split(' ')[0] !== roomId),
          }));
          sync(() => supabase.from('rooms').update({ status: 'sucia', guest: null }).eq('id', roomId));
          if (arrival) sync(() => supabase.from('arrivals').delete().eq('id', arrival.id));

          const taskId = `HK-${Date.now()}`;
          const task = {
            id: taskId, room: roomId,
            type: 'salida', typeLabel: 'Salida',
            status: 'pendiente', priority: 'media',
            sla: 'Antes de 14:00',
            note: null, tags: [], assignedTo: null,
            progress: 0, total: null, completedAt: null,
          };
          set((s) => ({ tasks: [task, ...s.tasks] }));
          sync(() => supabase.from('tasks').insert(toTask(task)));

          logActivity('reception', 'Recepción',
            `Checkout: ${guestName || '—'} · Hab ${roomId} → tarea de limpieza creada`,
            roomId, taskId);
        },

        // ── Llegadas (Recepción) ──────────────────────────────────────
        addArrival: (a) => {
          const id = `ARR-${Date.now()}`;
          const arrival = { id, done: false, ...a };
          set((s) => ({ arrivals: [arrival, ...s.arrivals] }));
          sync(() => supabase.from('arrivals').insert(toArrival(arrival)));
        },
        markArrived: (id) => {
          const arrival = get().arrivals.find((a) => a.id === id);
          const patch = { done: true, statusLabel: 'En habitación', status: 'ok' };
          set((s) => ({ arrivals: upsert(s.arrivals, id, patch) }));
          sync(() => supabase.from('arrivals').update({ done: true, status_label: 'En habitación', status: 'ok' }).eq('id', id));
          if (arrival?.room && arrival.room !== '—') {
            set((s) => ({ rooms: upsert(s.rooms, arrival.room, { status: 'ocupada', guest: arrival.guest }) }));
            sync(() => supabase.from('rooms').update({ status: 'ocupada', guest: arrival.guest }).eq('id', arrival.room));
          }
          logActivity('reception', 'Recepción', `Check-in: ${arrival?.guest || '—'}`, arrival?.room, id);
        },

        // ── Ventas / Reservas ─────────────────────────────────────────
        addReservation: (r) => {
          const id = `R-${Date.now()}`;
          const res = { id, ...r };
          set((s) => ({ reservations: [res, ...s.reservations] }));
          sync(() => supabase.from('reservations').insert(toRes(res)));
          const origin = r.channel?.includes('Recepción') ? 'reception' : 'sales';
          logActivity(origin, r.channel || 'Ventas',
            `Reserva: ${r.guestName || '—'} · ${r.stay || ''}`, r.room, id);
        },
        confirmReservation: (id) => {
          const res = get().reservations.find((r) => r.id === id);
          set((s) => ({ reservations: upsert(s.reservations, id, { status: 'confirmada' }) }));
          sync(() => supabase.from('reservations').update({ status: 'confirmada' }).eq('id', id));
          logActivity('sales', 'Ventas', `Reserva confirmada: ${res?.guestName || id}`, res?.room, id);
        },

        // ── Órdenes de Evento ─────────────────────────────────────────
        addEvent: (ev) => {
          const id = `EVT-${Date.now()}`;
          const evento = {
            id,
            acks: { housekeeping: null, maintenance: null, reception: null, purchasing: null },
            ...ev,
          };
          set((s) => ({ events: [evento, ...s.events] }));
          sync(() => supabase.from('events').insert(toEvent(evento)));
          logActivity('sales', ev.createdBy || 'Ventas',
            `Nuevo evento: ${ev.name || '—'} · ${ev.pax || 0} pax`, ev.salon, id);
        },
        updateEvent: (id, patch) => {
          set((s) => ({ events: upsert(s.events, id, patch) }));
          const updated = get().events.find((e) => e.id === id);
          if (updated) sync(() => supabase.from('events').update(toEvent(updated)).eq('id', id));
          const ev = get().events.find((e) => e.id === id);
          const statusNote = patch.status ? ` · ${patch.status}` : '';
          logActivity('sales', 'Ventas', `Evento actualizado: ${ev?.name || id}${statusNote}`, ev?.salon, id);
        },
        confirmEventAck: (eventId, role) => {
          const at = new Date().toISOString();
          const ev = get().events.find((e) => e.id === eventId);
          set((s) => ({
            events: s.events.map((e) => {
              if (e.id !== eventId) return e;
              return { ...e, acks: { ...e.acks, [role]: at } };
            }),
          }));
          const updatedAcks = { ...(ev?.acks || {}), [role]: at };
          sync(() => supabase.from('events').update({ acks: updatedAcks }).eq('id', eventId));
          logActivity(role, '—', `Acuse recibido: ${ev?.name || eventId}`, ev?.salon, eventId);
        },
        changeEventPax: (eventId, newPax) => {
          const ev = get().events.find((e) => e.id === eventId);
          const oldPax = ev?.pax ?? '?';
          set((s) => ({ events: upsert(s.events, eventId, { pax: newPax }) }));
          sync(() => supabase.from('events').update({ pax: newPax }).eq('id', eventId));
          logActivity('sales', 'Ventas',
            `⚠ Cambio de pax: ${oldPax} → ${newPax} · ${ev?.name || eventId}`,
            ev?.salon, eventId);
        },

        // ── Comentarios ───────────────────────────────────────────────
        addComment: ({ entityType, entityId, author, role, body }) => {
          const at = new Date().toISOString();
          set((s) => ({
            comments: [
              ...s.comments,
              { id: `CMT-${Date.now()}`, entityType, entityId, author, role, body, at },
            ],
          }));
          sync(() => supabase.from('comments').insert({
            entity_type: entityType, entity_id: entityId, author, role, body,
          }));
        },

        // ── Requisiciones ─────────────────────────────────────────────
        addRequisition: (r) => {
          const id = `REQ-${Date.now()}`;
          const now = new Date().toISOString();
          const req = { id, status: 'pedido', createdAt: now, updatedAt: now, ...r };
          set((s) => ({ requisitions: [req, ...s.requisitions] }));
          sync(() => supabase.from('requisitions').insert(toReq(req)));
          logActivity(r.area || 'purchasing', r.requestedBy || '—',
            `Requisición: ${r.item || '—'} (×${r.qty || 1})`, null, id);
        },
        updateRequisitionStatus: (id, status) => {
          const now = new Date().toISOString();
          set((s) => ({ requisitions: upsert(s.requisitions, id, { status, updatedAt: now }) }));
          sync(() => supabase.from('requisitions').update({ status, updated_at: now }).eq('id', id));
          const req = get().requisitions.find((r) => r.id === id);
          logActivity('purchasing', 'Compras',
            `Requisición ${status}: ${req?.item || id}`, null, id);
        },

        // ── Stubs sin rol activo ──────────────────────────────────────
        addRequest:      (req) => set((s) => ({ requests: [{ id: `C-${Date.now()}`, ...req }, ...s.requests] })),
        startOrder:      () => {},
        markOrderReady:  () => {},

        // ── Reset total (solo dev / offline) ──────────────────────────
        resetAll: () => {
          _channel?.unsubscribe();
          _channel = null;
          set({ ...seed, _hydrated: false });
        },
      },
    }),
    {
      name: 'hpj.data',
      version: 12,
      partialize: (s) => {
        // Online: Supabase es la fuente de verdad → no persistir en localStorage
        if (isOnlineMode) return {};
        const { actions, _hydrated, ...rest } = s;
        return rest;
      },
    }
  )
);

// ── Selectores ────────────────────────────────────────────────────────
export const useRooms        = () => useData((s) => s.rooms);
export const useTickets      = () => useData((s) => s.tickets);
export const useTasks        = () => useData((s) => s.tasks);
export const useReservations = () => useData((s) => s.reservations);
export const useArrivals     = () => useData((s) => s.arrivals);
export const useCustomers    = () => useData((s) => s.customers);
export const useRoomTypes    = () => useData((s) => s.roomTypes);
export const useEvents       = () => useData((s) => s.events);
export const useRequisitions = () => useData((s) => s.requisitions);
export const useRequests     = () => useData((s) => s.requests);
export const useOrders       = () => useData((s) => s.orders);
export const useActions      = () => useData((s) => s.actions);

export const useComments = (entityType, entityId) =>
  useData((s) => s.comments.filter((c) => c.entityType === entityType && c.entityId === entityId));
