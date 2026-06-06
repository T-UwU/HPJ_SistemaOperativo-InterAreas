// src/roles/sales/SalesEvents.jsx — Dashboard de eventos para Ventas.
// Más complejo que el EventsList genérico: stats, filtros por salón y estado,
// vista de lista enriquecida y vista de mes.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, Body, Eyebrow, Card, Pill,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useEvents } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';
import { useActivityUnread } from '../../store/activity.js';

const STATUS_FILTERS = [
  { id: 'todos',      label: 'Todos' },
  { id: 'proximos',   label: 'Próximos' },
  { id: 'confirmado', label: 'Confirmados' },
  { id: 'borrador',   label: 'Borradores' },
  { id: 'cerrado',    label: 'Cerrados' },
];

const STATUS_KIND  = { confirmado: 'ok', borrador: '', cerrado: 'info' };
const MES_CORTO    = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTH_NAMES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_HEADERS  = ['L','M','M','J','V','S','D'];

const AREA_ORDER   = ['reception', 'housekeeping', 'maintenance', 'purchasing'];
const AREA_LABEL   = { housekeeping: 'Limpieza', maintenance: 'Mantenimiento', reception: 'Recepción', purchasing: 'Compras' };
const AREA_COLOR   = { housekeeping: 'var(--info)', maintenance: 'var(--danger)', reception: 'var(--brass)', purchasing: '#2D6A4F' };

function monthLabel() {
  const d = new Date();
  return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
}

export default function SalesEvents() {
  const navigate     = useNavigate();
  const events       = useEvents();
  const user         = useCurrentUser();
  const actUnread    = useActivityUnread(user?.roleId);
  const [view,         setView]         = useState('list');
  const [statusFilter, setStatusFilter] = useState('proximos');

  const todayStr  = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);

  // Stats del mes actual
  const monthEvents  = events.filter((e) => e.date.startsWith(thisMonth));
  const confirmed    = monthEvents.filter((e) => e.status === 'confirmado');
  const totalPax     = confirmed.reduce((sum, e) => sum + (e.pax || 0), 0);
  const pendingAcks  = events.filter((e) =>
    e.status !== 'cerrado' && AREA_ORDER.some((a) => !e.acks?.[a])
  ).length;

  // Filtrado
  let filtered = [...events];
  if (statusFilter === 'proximos')   filtered = filtered.filter((e) => e.date >= todayStr && e.status !== 'cerrado');
  else if (statusFilter !== 'todos') filtered = filtered.filter((e) => e.status === statusFilter);

  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        eyebrow={monthLabel()}
        title="Eventos"
        trailing={
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <ViewToggle view={view} setView={setView}/>
            <IconBtn icon={I.bell} badge={actUnread || undefined} onClick={() => navigate('/sales/notifications')}/>
            <IconBtn icon={I.plus} onClick={() => navigate('/sales/events/new')}/>
          </div>
        }
      />

      {/* Filtro por estado */}
      <div style={{ padding: '2px 16px 8px', display: 'flex', gap: 5, overflowX: 'auto' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`pill ${statusFilter === f.id ? 'pill-forest' : ''}`}
            onClick={() => setStatusFilter(f.id)}
            style={{ whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', flexShrink: 0, fontSize: 11 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Body style={{ paddingBottom: 80 }}>
        {view === 'cal' ? (
          <CalendarView events={sorted} navigate={navigate}/>
        ) : (
          <ListView events={sorted} navigate={navigate}/>
        )}
      </Body>

    </PhoneScreen>
  );
}

// ── Vista de lista enriquecida ─────────────────────────────

function ListView({ events, navigate }) {
  if (events.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        Sin eventos con estos filtros.
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {events.map((ev) => (
        <RichEventCard key={ev.id} event={ev} onClick={() => navigate(`/sales/events/${ev.id}`)}/>
      ))}
    </div>
  );
}

function RichEventCard({ event, onClick }) {
  const day = event.date.split('-')[2];
  const mon = MES_CORTO[parseInt(event.date.split('-')[1], 10) - 1];
  const pendingAcks = AREA_ORDER.filter((a) => !event.acks?.[a]).length;
  const isPast = event.date < new Date().toISOString().slice(0, 10);

  return (
    <Card style={{ padding: 0, overflow: 'hidden', opacity: event.status === 'cerrado' ? 0.7 : 1 }} onClick={onClick}>
      <div style={{ display: 'flex' }}>
        {/* Bloque de fecha */}
        <div style={{
          width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '12px 0',
          background: event.status === 'confirmado' ? 'var(--forest-soft)' : 'var(--card-2)',
          borderRight: '1px solid var(--line-soft)',
        }}>
          <div className="hpj-serif" style={{ fontSize: 24, lineHeight: 1, color: 'var(--forest-deep)', fontWeight: 500 }}>{day}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{mon}</div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.name}
            </span>
            <Pill
              kind={STATUS_KIND[event.status] ?? ''}
              style={{ height: 18, fontSize: 9, flexShrink: 0 }}
            >
              {event.status.toUpperCase()}
            </Pill>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            <b style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{event.salon}</b>
            {' · '}{event.time}
            {' · '}<b style={{ color: 'var(--ink-2)' }}>{event.pax} pax</b>
          </div>

          {event.client && (
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>
              {event.client}
            </div>
          )}

          {/* Acuses */}
          <div style={{ display: 'flex', gap: 4, marginTop: 7, alignItems: 'center' }}>
            {AREA_ORDER.map((area) => {
              const at = event.acks?.[area];
              return (
                <span
                  key={area}
                  title={`${AREA_LABEL[area]}: ${at ? 'confirmado' : 'pendiente'}`}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: at ? AREA_COLOR[area] : 'var(--card-2)',
                    border: `1.5px solid ${at ? AREA_COLOR[area] : 'var(--line)'}`,
                  }}
                />
              );
            })}
            {pendingAcks > 0 && event.status !== 'cerrado' && (
              <span style={{ fontSize: 10, color: 'var(--warn)', marginLeft: 2, fontWeight: 600 }}>
                {pendingAcks} sin acuse
              </span>
            )}
            {pendingAcks === 0 && (
              <span style={{ fontSize: 10, color: 'var(--ok)', marginLeft: 2 }}>
                Todas las áreas al tanto
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Vista de calendario de mes ─────────────────────────────

function CalendarView({ events, navigate }) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset      = (new Date(year, month, 1).getDay() + 6) % 7;
  const monthStr    = `${year}-${String(month + 1).padStart(2, '0')}`;

  const byDay = {};
  for (const ev of events) {
    if (!ev.date.startsWith(monthStr)) continue;
    const d = parseInt(ev.date.split('-')[2], 10);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(ev);
  }

  const cells  = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isToday = (d) => d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div style={{ padding: '0 12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px 14px' }}>
        <button onClick={prev} style={navBtn}>{I.chevL}</button>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</span>
        <button onClick={next} style={navBtn}>{I.chevR}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAY_HEADERS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.05em', paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>;
          const evs   = byDay[day] || [];
          const today = isToday(day);
          return (
            <div key={i} style={{
              borderRadius: 8, padding: '4px 3px',
              background: evs.length ? 'var(--forest-soft)' : today ? 'var(--card-2)' : 'transparent',
              border: `1px solid ${today ? 'var(--forest)' : 'transparent'}`,
            }}>
              <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 2, fontWeight: today ? 700 : 400, color: today ? 'var(--forest-deep)' : 'var(--ink)' }}>
                {day}
              </div>
              {evs.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/sales/events/${ev.id}`)}
                  style={{
                    fontSize: 9, lineHeight: 1.25, padding: '1px 3px', borderRadius: 3,
                    marginBottom: 1, cursor: 'pointer', wordBreak: 'break-word',
                    background: ev.status === 'confirmado' ? 'var(--forest)' : 'var(--brass-soft)',
                    color: ev.status === 'confirmado' ? 'var(--bg)' : 'var(--brass-deep)',
                  }}
                >
                  {ev.pax}p {(ev.name || '').split('·')[0].trim().slice(0, 8)}
                </div>
              ))}
              {evs.length > 2 && (
                <div style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>+{evs.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Toggle lista/calendario ────────────────────────────────

function ViewToggle({ view, setView }) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--card-2)' }}>
      {[{ id: 'list', icon: I.list }, { id: 'cal', icon: I.cal }].map(({ id, icon }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          style={{
            padding: '5px 8px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: view === id ? 'var(--forest)' : 'transparent',
            color: view === id ? 'var(--bg)' : 'var(--muted)',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

const navBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--ink)', padding: '4px 8px', borderRadius: 6,
  display: 'flex', alignItems: 'center',
};
