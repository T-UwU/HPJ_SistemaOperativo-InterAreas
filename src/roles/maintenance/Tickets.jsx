// src/roles/maintenance/Tickets.jsx — Lista de tickets activos.
// Migrado de screens-maintenance.jsx::MaintenanceTickets.
// · Lee tickets del store y filtra por status
// · Tap en card → /maintenance/ticket/:id
// · FAB crea un ticket dummy (TODO: pantalla de captura real)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, Body, Eyebrow,
  Card, Pill, RoleChip, FAB,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useTickets } from '../../store/data.js';
import { useActivityUnread } from '../../store/activity.js';
import { useCurrentUser } from '../../store/auth.js';

export default function MaintenanceTickets() {
  const navigate  = useNavigate();
  const tickets   = useTickets();
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);

  const [closedOpen, setClosedOpen] = useState(
    () => localStorage.getItem('hpj.maintenance.closedOpen') === 'true'
  );

  const toggleClosed = () => setClosedOpen((v) => {
    localStorage.setItem('hpj.maintenance.closedOpen', String(!v));
    return !v;
  });

  const active = tickets.filter((t) => t.status !== 'cerrado');
  const closed = tickets.filter((t) => t.status === 'cerrado');
  const urgent = active.filter((t) =>
    t.priority === 'alta' || t.status === 'aceptado'
  );
  const open      = active.filter((t) => t.status === 'abierto' && t.priority !== 'alta');
  const scheduled = active.filter((t) => t.status === 'programado');
  const highPriority = active.filter((t) => t.priority === 'alta').length;

  return (
    <PhoneScreen>
      <BrandStrip role="maintenance"/>
      <AppBar
        eyebrow={user?.name ? (user.shift && user.shift !== '—' ? `${user.name} · ${user.shift}` : user.name) : 'Mantenimiento'}
        title="Tickets abiertos"
        subtitle={`${active.length} abiertos · ${highPriority} alta prioridad`}
        trailing={
          <IconBtn icon={I.bell} badge={actUnread || undefined} onClick={() => navigate('/maintenance/notifications')}/>
        }
      />
      <Body style={{ paddingBottom: 80 }}>
        {urgent.length > 0 && (
          <>
            <Eyebrow>Urgentes</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {urgent.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onClick={() => navigate(`/maintenance/ticket/${t.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {open.length > 0 && (
          <>
            <Eyebrow>Abiertos</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {open.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onClick={() => navigate(`/maintenance/ticket/${t.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {scheduled.length > 0 && (
          <>
            <Eyebrow>Programados</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scheduled.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onClick={() => navigate(`/maintenance/ticket/${t.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {active.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Sin tickets abiertos.
          </div>
        )}

        {closed.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px 6px' }}>
              <button onClick={toggleClosed} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}>
                <span style={{
                  display: 'inline-flex', color: 'var(--muted)',
                  transform: closedOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.15s',
                }}>{I.chevD}</span>
                <span className="section-eyebrow">Cerrados recientes</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{closed.length}</span>
              </button>
              <button
                onClick={() => navigate('/maintenance/history')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 11, color: 'var(--forest)', fontWeight: 500, padding: 0 }}
              >
                ver historial →
              </button>
            </div>
            {closedOpen && (
              <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {closed.slice(0, 10).map((t) => (
                  <ClosedRow
                    key={t.id}
                    ticket={t}
                    onClick={() => navigate(`/maintenance/ticket/${t.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Body>
      <FAB icon={I.plus} label="Nuevo ticket" onClick={() => navigate('/maintenance/new-ticket')}/>
    </PhoneScreen>
  );
}

function ClosedRow({ ticket, onClick }) {
  const { room, category, desc, closedAt } = ticket;
  const time = closedAt
    ? new Date(closedAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
        background: 'var(--card-2)', border: '1px solid var(--line-soft)',
        display: 'flex', alignItems: 'center', gap: 10, opacity: 0.85,
      }}
    >
      <span style={{ color: 'var(--ok)', fontSize: 14, flexShrink: 0 }}>{I.check}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {room} · {desc}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{category} · {time}</div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, onClick }) {
  const { id, room, category, desc, reportedBy, sla, status, priority, progress } = ticket;
  const pColor =
    priority === 'alta' ? 'var(--danger)' :
    priority === 'media' ? 'var(--warn)' :
    'var(--muted-2)';
  const active = status === 'aceptado';
  const slaUrgent = typeof sla === 'string' && sla.startsWith('00:');

  return (
    <Card style={{ padding: 14, borderLeft: `3px solid ${pColor}` }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="hpj-mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>#{id}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Pill kind={priority === 'alta' ? 'danger' : priority === 'media' ? 'warn' : ''}
            style={{ height: 18, fontSize: 10 }}>{priority.toUpperCase()}</Pill>
          {status === 'aceptado'   && <Pill kind="brass" style={{ height: 18, fontSize: 10 }}>EN CURSO</Pill>}
          {status === 'programado' && <Pill kind="info"  style={{ height: 18, fontSize: 10 }}>PROGRAM.</Pill>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'var(--card-2)', color: 'var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: '1px solid var(--line)',
        }}>{I.wrench}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500 }}>{room}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {category}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            {reportedBy && <RoleChip role={reportedBy}/>}
            <span className="hpj-mono" style={{ fontSize: 11, color: slaUrgent ? 'var(--danger)' : 'var(--muted)' }}>
              SLA {sla}
            </span>
          </div>
        </div>
      </div>
      {active && (
        <div style={{ marginTop: 10, height: 4, borderRadius: 999, background: 'var(--card-2)', overflow: 'hidden' }}>
          <div style={{ width: (progress || 0) + '%', height: '100%', background: 'var(--brass)' }}/>
        </div>
      )}
    </Card>
  );
}
