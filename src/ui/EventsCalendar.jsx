// src/ui/EventsCalendar.jsx — Calendario de Ordenes de Evento.
// Reutilizable entre roles: prop `role` controla permisos.
// - sales: puede crear y editar eventos
// - resto: solo lectura + botón "Confirmar recibido"
//
// Exporta dos componentes:
//   <EventsList role="reception" />   → se monta en la ruta /[role]/events
//   <EventDetail role="reception" />  → se monta en la ruta /[role]/events/:id

import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, BackBtn, Body, Eyebrow,
  Card, Pill,
} from './shared.jsx';
import { I } from './icons.jsx';
import { useEvents, useActions } from '../store/data.js';
import { useCurrentUser } from '../store/auth.js';
import CommentThread from './CommentThread.jsx';

// ── Metadatos por área ─────────────────────────────────────
const AREA_LABEL = {
  housekeeping: 'Limpieza',
  maintenance:  'Mantenimiento',
  reception:    'Recepción',
  purchasing:   'Compras',
};

const AREA_COLOR = {
  housekeeping: 'var(--info)',
  maintenance:  'var(--danger)',
  reception:    'var(--brass)',
  purchasing:   '#2D6A4F',
};

const AREA_ORDER = ['reception', 'housekeeping', 'maintenance', 'purchasing'];

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_HEADERS = ['L','M','M','J','V','S','D'];

// ── Lista de eventos ───────────────────────────────────────
export function EventsList({ role }) {
  const navigate  = useNavigate();
  const events    = useEvents();
  const [view, setView] = useState('list'); // 'list' | 'cal'

  const sorted   = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => e.status !== 'cerrado');
  const past     = sorted.filter((e) => e.status === 'cerrado');

  return (
    <PhoneScreen>
      <BrandStrip role={role}/>
      <AppBar
        eyebrow="Próximos eventos"
        title="Calendario"
        trailing={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Toggle lista / mes */}
            <div style={{
              display: 'flex', borderRadius: 8, overflow: 'hidden',
              border: '1px solid var(--line)', background: 'var(--card-2)',
            }}>
              <ViewBtn icon={I.list} active={view === 'list'} onClick={() => setView('list')}/>
              <ViewBtn icon={I.cal}  active={view === 'cal'}  onClick={() => setView('cal')}/>
            </div>
            {role === 'sales' && (
              <IconBtn icon={I.plus} onClick={() => navigate(`/${role}/events/new`)}/>
            )}
          </div>
        }
      />
      <Body style={{ paddingBottom: 24 }}>
        {view === 'cal' ? (
          <MonthView events={sorted} role={role} navigate={navigate}/>
        ) : (
          <>
            {upcoming.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                Sin eventos programados.
              </div>
            )}
            {upcoming.length > 0 && (
              <>
                <Eyebrow>Programados</Eyebrow>
                <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcoming.map((ev) => (
                    <EventCard key={ev.id} event={ev} myRole={role}
                      onClick={() => navigate(`/${role}/events/${ev.id}`)}/>
                  ))}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <Eyebrow>Cerrados</Eyebrow>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {past.map((ev) => (
                    <EventCard key={ev.id} event={ev} myRole={role}
                      onClick={() => navigate(`/${role}/events/${ev.id}`)}/>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}

// ── Vista de mes ───────────────────────────────────────────
function MonthView({ events, role, navigate }) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // offset lunes-primero (0=lun … 6=dom)
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const byDay = {};
  for (const ev of events) {
    if (!ev.date.startsWith(monthStr)) continue;
    const d = parseInt(ev.date.split('-')[2], 10);
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(ev);
  }

  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isToday = (d) => d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div style={{ padding: '0 12px 16px' }}>
      {/* Navegación de mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px 14px' }}>
        <button onClick={prevMonth} style={navBtnStyle}>{I.chevL}</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>{I.chevR}</button>
      </div>

      {/* Cabecera días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAY_HEADERS.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 600,
            color: 'var(--muted)', letterSpacing: '0.05em', paddingBottom: 4,
          }}>{d}</div>
        ))}
      </div>

      {/* Celdas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>;
          const evs = byDay[day] || [];
          const today = isToday(day);
          return (
            <div key={i} style={{
              borderRadius: 8, padding: '4px 3px',
              background: evs.length ? 'var(--forest-soft)' : today ? 'var(--card-2)' : 'transparent',
              border: `1px solid ${today ? 'var(--forest)' : 'transparent'}`,
            }}>
              <div style={{
                textAlign: 'center', fontSize: 11, marginBottom: 2,
                fontWeight: today ? 700 : 400,
                color: today ? 'var(--forest-deep)' : 'var(--ink)',
              }}>{day}</div>
              {evs.slice(0, 2).map((ev) => (
                <div key={ev.id}
                  onClick={() => navigate(`/${role}/events/${ev.id}`)}
                  style={{
                    fontSize: 9, lineHeight: 1.25, padding: '1px 3px', borderRadius: 3,
                    marginBottom: 1, cursor: 'pointer', wordBreak: 'break-word',
                    background: ev.status === 'confirmado' ? 'var(--forest)' : 'var(--brass-soft)',
                    color: ev.status === 'confirmado' ? 'var(--bg)' : 'var(--brass-deep)',
                  }}
                >
                  {ev.pax}p {(ev.name || '—').split('·')[0].trim()}
                </div>
              ))}
              {evs.length > 2 && (
                <div style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
                  +{evs.length - 2}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Botón de toggle vista ──────────────────────────────────
function ViewBtn({ icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 8px', border: 'none', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: active ? 'var(--forest)' : 'transparent',
      color: active ? 'var(--bg)' : 'var(--muted)',
    }}>{icon}</button>
  );
}

const navBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--ink)', padding: '4px 8px', borderRadius: 6,
  display: 'flex', alignItems: 'center',
};

// ── Detalle de un evento ───────────────────────────────────
export function EventDetail({ role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const events = useEvents();
  const user   = useCurrentUser();
  const { confirmEventAck, changeEventPax, updateEvent } = useActions();
  const [editPax, setEditPax] = useState(false);
  const [paxInput, setPaxInput] = useState('');

  const event = events.find((e) => e.id === id);
  if (!event) return <Navigate to={`/${role}/events`} replace />;

  const myAck = event.acks?.[role];
  const isSales = role === 'sales';

  const handleAck = () => {
    if (!myAck) confirmEventAck(event.id, role);
  };

  const handlePaxSave = () => {
    const n = parseInt(paxInput, 10);
    if (!isNaN(n) && n > 0) changeEventPax(event.id, n);
    setEditPax(false);
  };

  return (
    <PhoneScreen>
      {/* Encabezado del evento */}
      <div style={{
        padding: '12px 18px 16px',
        background: event.status === 'confirmado' ? 'var(--forest-deep)' : 'var(--ink)',
        color: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <BackBtn label="Eventos"/>
          <span className="hpj-mono" style={{ fontSize: 10, opacity: 0.5 }}>{event.id}</span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, marginBottom: 6 }}>
          {event.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.08em',
            background: event.status === 'confirmado' ? 'var(--brass)' : event.status === 'borrador' ? 'rgba(255,255,255,0.15)' : 'var(--danger)',
            color: event.status === 'borrador' ? 'rgba(255,255,255,0.7)' : '#FAF4E6',
          }}>{event.status.toUpperCase()}</span>
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            {formatDate(event.date)} · {event.time}
          </span>
        </div>
        {/* PAX destacado */}
        <div style={{
          marginTop: 12, padding: '10px 14px',
          background: 'rgba(255,255,255,0.1)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Comensales</div>
            {editPax ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                <input
                  autoFocus
                  type="number"
                  value={paxInput}
                  onChange={(e) => setPaxInput(e.target.value)}
                  style={{
                    width: 60, fontSize: 22, fontFamily: 'var(--serif)', fontWeight: 500,
                    background: 'rgba(255,255,255,0.2)', border: 'none',
                    color: 'var(--bg)', borderRadius: 6, padding: '2px 6px', outline: 'none',
                  }}
                />
                <button onClick={handlePaxSave} style={{
                  background: 'var(--brass)', color: '#FAF4E6', border: 'none',
                  borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                }}>OK</button>
              </div>
            ) : (
              <div className="hpj-serif" style={{ fontSize: 32, lineHeight: 1, fontWeight: 500 }}>
                {event.pax}
                {isSales && (
                  <button onClick={() => { setEditPax(true); setPaxInput(String(event.pax)); }}
                    style={{
                      marginLeft: 8, background: 'none', border: 'none',
                      color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14,
                    }}>{I.more}</button>
                )}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Salón</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{event.salon}</div>
          </div>
        </div>
      </div>

      <Body style={{ paddingBottom: 80 }}>
        {/* Acuses de recibido */}
        <Eyebrow>Acuses de recibido</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <Card style={{ padding: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AREA_ORDER.map((area) => {
                const at = event.acks?.[area];
                const color = AREA_COLOR[area];
                const label = AREA_LABEL[area];
                const time  = at ? new Date(at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : null;
                return (
                  <div key={area} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                    borderRadius: 999,
                    background: at ? `${color}22` : 'var(--card-2)',
                    border: `1px solid ${at ? color : 'var(--line)'}`,
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: at ? color : 'var(--muted-2)',
                      flexShrink: 0,
                    }}/>
                    <span style={{ fontSize: 11, fontWeight: 500, color: at ? color : 'var(--muted)' }}>
                      {label}
                    </span>
                    {at && (
                      <span className="hpj-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
                        {time}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Detalles del evento */}
        <Eyebrow>Detalle</Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <InfoRow label="Cliente"   value={event.client}/>
          <InfoRow label="Menú"      value={event.menu}/>
          {event.allergens && event.allergens !== 'Ninguno reportado' && (
            <InfoRow label="Alergenos" value={event.allergens} danger/>
          )}
          {event.notes && <InfoRow label="Notas" value={event.notes}/>}
        </div>

        {/* Comentarios contextuales */}
        <CommentThread entityType="event" entityId={event.id}/>
      </Body>

      {/* Botón de acuse (no es Ventas) */}
      {!isSales && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line-soft)' }}>
          {myAck ? (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--ok-soft)', border: '1px solid var(--ok)',
              fontSize: 13, color: 'var(--ok)', fontWeight: 500,
              textAlign: 'center',
            }}>
              ✓ Recibido por {AREA_LABEL[role]} ·{' '}
              {new Date(myAck).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAck}>
              Confirmar recibido
            </button>
          )}
        </div>
      )}

      {/* Botón de edición para Ventas */}
      {isSales && event.status !== 'cerrado' && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line-soft)' }}>
          <button
            className="btn btn-ghost"
            style={{ width: '100%' }}
            onClick={() => navigate(`/${role}/events/${event.id}/edit`)}
          >
            Editar evento
          </button>
        </div>
      )}
    </PhoneScreen>
  );
}

// ── Tarjeta compacta para la lista ─────────────────────────
function EventCard({ event, myRole, onClick }) {
  const pendingAcks = AREA_ORDER.filter((a) => !event.acks?.[a]).length;
  return (
    <Card style={{ padding: 12 }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Bloque de fecha */}
        <div style={{
          width: 44, flexShrink: 0, textAlign: 'center', paddingTop: 2,
        }}>
          <div className="hpj-serif" style={{ fontSize: 22, lineHeight: 1, color: 'var(--forest-deep)', fontWeight: 500 }}>
            {event.date.split('-')[2]}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
            {MES_CORTO[parseInt(event.date.split('-')[1], 10) - 1]}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.name}
            </span>
            <Pill
              kind={event.status === 'confirmado' ? 'ok' : event.status === 'borrador' ? '' : 'danger'}
              style={{ height: 18, fontSize: 9, flexShrink: 0 }}
            >
              {event.status.toUpperCase()}
            </Pill>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            {event.salon} · {event.time} · <b style={{ color: 'var(--ink-2)' }}>{event.pax} pax</b>
          </div>

          {/* Dots de acuse */}
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {AREA_ORDER.map((area) => {
              const at = event.acks?.[area];
              const isMe = area === myRole;
              return (
                <span
                  key={area}
                  title={`${AREA_LABEL[area]}: ${at ? 'confirmado' : 'pendiente'}`}
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: at ? AREA_COLOR[area] : 'var(--card-2)',
                    border: `1.5px solid ${at ? AREA_COLOR[area] : 'var(--line)'}`,
                    outline: isMe && !at ? '2px solid var(--brass)' : 'none',
                    outlineOffset: 1,
                  }}
                />
              );
            })}
            {pendingAcks > 0 && (
              <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>
                {pendingAcks} pendiente{pendingAcks > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Helpers ────────────────────────────────────────────────
function InfoRow({ label, value, danger }) {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 10,
      background: danger ? 'rgba(220,50,50,0.06)' : 'var(--card)',
      border: `1px solid ${danger ? 'var(--danger)' : 'var(--line)'}`,
    }}>
      <div style={{ fontSize: 10, color: danger ? 'var(--danger)' : 'var(--muted)', fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: danger ? 'var(--danger)' : 'var(--ink)', lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [, m, d] = dateStr.split('-');
  const mes = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d, 10)} ${mes[parseInt(m, 10) - 1]}`;
}

const MES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
