// src/roles/reception/Home.jsx — Dashboard de actividad cruzada para Recepción.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, Body, Card,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useCurrentUser } from '../../store/auth.js';
import { useActivity, useActivityUnread } from '../../store/activity.js';
import { useTickets } from '../../store/data.js';

const ROLE_LABEL = {
  reception: 'Recepción', housekeeping: 'Limpieza',
  sales: 'Ventas', maintenance: 'Mantenimiento', purchasing: 'Compras',
};

const ROLE_COLOR = {
  reception: 'var(--brass)', housekeeping: 'var(--info)',
  sales: '#7C5F8A', maintenance: 'var(--danger)', purchasing: 'var(--forest)',
};

function todayLabel() {
  const d = new Date();
  const weekday = d.toLocaleDateString('es-MX', { weekday: 'long' });
  const dayMonth = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} · ${dayMonth}`;
}

export default function ReceptionHome() {
  const navigate = useNavigate();
  const user     = useCurrentUser();
  const unread   = useActivityUnread(user?.roleId);
  const events   = useActivity((s) => s.events);
  const tickets  = useTickets();

  const [activeOpen,   setActiveOpen]   = useState(true);
  const [resolvedOpen, setResolvedOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(
    () => localStorage.getItem('hpj.reception.activityOpen') !== 'false'
  );

  const toggleActivity = () => setActivityOpen((v) => {
    localStorage.setItem('hpj.reception.activityOpen', String(!v));
    return !v;
  });
  const [clearedAt,    setClearedAt]    = useState(
    () => localStorage.getItem('hpj.reception.incidentsClearedAt') || null
  );

  const clearIncidents = () => {
    const now = new Date().toISOString();
    setClearedAt(now);
    localStorage.setItem('hpj.reception.incidentsClearedAt', now);
  };

  // Incidents: any maintenance or housekeeping event that describes a problem.
  // Detecting by role+action avoids false positives (acuses, ticket-close logs, etc.)
  const isIncident = (ev) =>
    (ev.role === 'maintenance' || ev.role === 'housekeeping') &&
    ev.action?.includes('Incidencia');

  const incidentEvents = events.filter(
    (ev) => isIncident(ev) && (!clearedAt || new Date(ev.created_at) > new Date(clearedAt))
  );
  const general = events.filter((ev) => !isIncident(ev));

  // Cross-reference ticket status: if ref_id points to a closed ticket → resolved
  const activeIncidents   = incidentEvents.filter((ev) => {
    if (!ev.ref_id) return true;
    const t = tickets.find((t) => t.id === ev.ref_id);
    return !t || t.status !== 'cerrado';
  });
  const resolvedIncidents = incidentEvents.filter((ev) => {
    if (!ev.ref_id) return false;
    const t = tickets.find((t) => t.id === ev.ref_id);
    return t?.status === 'cerrado';
  });

  return (
    <PhoneScreen>
      <BrandStrip role="reception"/>
      <AppBar
        eyebrow={todayLabel()}
        title={`Buenos días, ${user?.name?.split(' ')[0] || 'equipo'}`}
        serif
        trailing={
          <IconBtn icon={I.bell} badge={unread || undefined} onClick={() => navigate('/reception/notifications')}/>
        }
      />
      <Body style={{ paddingBottom: 80 }}>

        {activeIncidents.length > 0 && (
          <>
            <CollapseHeader
              label="Incidencias activas"
              count={activeIncidents.length}
              countColor="var(--danger)"
              open={activeOpen}
              onToggle={() => setActiveOpen((v) => !v)}
              onClear={clearIncidents}
            />
            {activeOpen && (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeIncidents.slice(0, 5).map((ev) => (
                  <IncidentRow key={ev.id} ev={ev} resolved={false}/>
                ))}
              </div>
            )}
          </>
        )}

        {resolvedIncidents.length > 0 && (
          <>
            <CollapseHeader
              label="Incidencias resueltas"
              count={resolvedIncidents.length}
              open={resolvedOpen}
              onToggle={() => setResolvedOpen((v) => !v)}
            />
            {resolvedOpen && (
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resolvedIncidents.slice(0, 5).map((ev) => (
                  <IncidentRow key={ev.id} ev={ev} resolved/>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px 6px' }}>
          <button onClick={toggleActivity} style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
          }}>
            <span style={{
              display: 'inline-flex', color: 'var(--muted)',
              transform: activityOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.15s',
            }}>{I.chevD}</span>
            <span className="section-eyebrow">Actividad del hotel</span>
          </button>
          <button onClick={() => navigate('/reception/notifications')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, color: 'var(--muted)', padding: 0,
          }}>
            ver todo →
          </button>
        </div>
        {activityOpen && (
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {general.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>
                Sin actividad reciente.
              </div>
            ) : (
              general.slice(0, 10).map((ev) => (
                <ActivityRow key={ev.id} ev={ev}/>
              ))
            )}
          </div>
        )}
      </Body>
    </PhoneScreen>
  );
}

function CollapseHeader({ label, count, countColor, open, onToggle, onClear }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px 6px' }}>
      <button onClick={onToggle} style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        padding: 0, textAlign: 'left',
      }}>
        <span style={{
          display: 'inline-flex', color: 'var(--muted)',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 0.15s',
        }}>{I.chevD}</span>
        <span className="section-eyebrow">{label}</span>
        {count != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: countColor || 'var(--muted)' }}>
            {count}
          </span>
        )}
      </button>
      {onClear && (
        <button onClick={onClear} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, color: 'var(--muted)', padding: 0,
        }}>
          Limpiar
        </button>
      )}
    </div>
  );
}

function IncidentRow({ ev, resolved }) {
  const time = new Date(ev.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return (
    <Card style={{ padding: 0, overflow: 'hidden', borderLeft: `3px solid ${resolved ? 'var(--ok)' : 'var(--danger)'}`, opacity: resolved ? 0.75 : 1 }}>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', color: resolved ? 'var(--ok)' : 'var(--danger)' }}>
            {resolved ? 'RESUELTA' : 'INCIDENCIA'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{time}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.4 }}>{ev.action}</div>
        {ev.room && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{ev.room}</div>
        )}
        {ev.actor && ev.actor !== '—' && (
          <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>
            {resolved ? 'Reportado por' : 'Reportado por'} {ev.actor}
          </div>
        )}
      </div>
    </Card>
  );
}

function ActivityRow({ ev }) {
  const color = ROLE_COLOR[ev.role] || 'var(--ink-3)';
  const label = ROLE_LABEL[ev.role] || ev.role;
  const time  = new Date(ev.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return (
    <Card style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, marginTop: 4 }}/>
      <div style={{ flex: 1, fontSize: 13 }}>
        <div><b style={{ fontWeight: 600 }}>{label}</b> · {ev.action}</div>
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>
          {ev.room && `${ev.room} · `}{time}
        </div>
      </div>
    </Card>
  );
}
