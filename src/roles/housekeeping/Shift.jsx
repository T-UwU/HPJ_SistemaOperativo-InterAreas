// src/roles/housekeeping/Shift.jsx — Resumen del turno.
// Migrado de screens-housekeeping.jsx::HousekeepingShift.
// · Métricas computadas desde useTasks() (completadas vs total)
// · Tickets que generé: filtro de useTickets() por reportedBy=housekeeping
// · "Finalizar turno" → /housekeeping/me (donde está el logout)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Metric, Pill,
} from '../../ui/shared.jsx';
import { useTasks, useTickets } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';

function shiftLabel(user) {
  const d = new Date();
  const weekday = d.toLocaleDateString('es-MX', { weekday: 'long' });
  const dayMonth = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const shift = user?.shift && user.shift !== '—' ? ` · ${user.shift}` : '';
  return `${cap} ${dayMonth}${shift}`;
}

export default function HousekeepingShift() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const tasks = useTasks();
  const tickets = useTickets();

  const completed = tasks.filter((t) => t.status === 'completada').length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const myTickets = tickets.filter((t) => t.reportedBy === 'housekeeping');

  return (
    <PhoneScreen>
      <BrandStrip role="housekeeping"/>
      <AppBar
        eyebrow={shiftLabel(user)}
        title="Mi turno"
        serif
      />
      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '4px 16px 0', display: 'flex', gap: 8 }}>
          <Metric label="Completadas" value={String(completed)} sub={`/ ${total}`} foot={`${pct}% del turno`}/>
          <Metric label="Pendientes" value={String(total - completed)} foot="tareas restantes"/>
        </div>

        {myTickets.length > 0 && (
          <>
            <Eyebrow>Tickets que generé hoy</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTickets.map((t) => (
                <TicketLink
                  key={t.id}
                  room={t.room}
                  text={t.desc}
                  status={t.status === 'cerrado' ? 'resuelto' : 'abierto'}
                />
              ))}
            </div>
          </>
        )}

        <div style={{ padding: '0 16px 18px' }}>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => navigate('/housekeeping/me')}>
            Finalizar turno
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function TicketLink({ room, text, status }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      background: 'var(--card-2)', border: '1px solid var(--line-soft)', borderRadius: 10,
    }}>
      <span className="hpj-mono" style={{ fontSize: 11, color: 'var(--brass-deep)', minWidth: 32 }}>#{room}</span>
      <div style={{ flex: 1, fontSize: 13 }}>{text}</div>
      <Pill kind={status === 'resuelto' ? 'ok' : 'warn'} style={{ height: 18, fontSize: 10 }}>
        {status.toUpperCase()}
      </Pill>
    </div>
  );
}
