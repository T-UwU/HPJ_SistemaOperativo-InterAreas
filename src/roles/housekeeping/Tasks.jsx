// src/roles/housekeeping/Tasks.jsx — Mis tareas (lista).
// Migrado de screens-housekeeping.jsx::HousekeepingTasks.
// · Lee tasks del store
// · Cada card navega a /housekeeping/task/:id
// · FAB navega a /housekeeping/report (crear ticket de mantenimiento)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, Body, Eyebrow,
  Card, Pill, FAB, Icon,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useTasks, useTickets } from '../../store/data.js';
import { useActivityUnread } from '../../store/activity.js';
import { useCurrentUser } from '../../store/auth.js';

export default function HousekeepingTasks() {
  const navigate  = useNavigate();
  const tasks     = useTasks();
  const allTickets = useTickets();
  const myTickets  = allTickets.filter((t) => t.reportedBy === 'housekeeping');
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);

  const pending   = tasks.filter((t) => t.status !== 'completada');
  const completed = tasks.filter((t) => t.status === 'completada');
  const pct = tasks.length === 0
    ? 0
    : Math.round((completed.length / tasks.length) * 100);

  return (
    <PhoneScreen>
      <BrandStrip role="housekeeping"/>
      <AppBar
        eyebrow={user?.name || 'Limpieza'}
        title="Mis tareas"
        subtitle={`${tasks.length} asignadas · ${completed.length} completadas`}
        trailing={<>
          <IconBtn icon={I.plus} onClick={() => navigate('/housekeeping/new-task')}/>
          <IconBtn icon={I.bell} badge={actUnread || undefined} onClick={() => navigate('/housekeeping/notifications')}/>
        </>}
      />
      <ProgressBar pct={pct}/>
      <Body style={{ paddingBottom: 80 }}>
        {pending.length > 0 ? (
          <>
            <Eyebrow>Pendientes</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onClick={() => navigate(`/housekeeping/task/${t.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Sin tareas pendientes.
          </div>
        )}

        {completed.length > 0 && (
          <>
            <Eyebrow>Completadas hoy</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completed.map((t) => (
                <DoneRow key={t.id} room={t.room} type={t.typeLabel || t.type} time={t.completedAt || '—'}/>
              ))}
            </div>
          </>
        )}

        {myTickets.length > 0 && (
          <>
            <Eyebrow right={`${myTickets.length}`}>Incidencias reportadas</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTickets.map((t) => (
                <IncidentRow key={t.id} ticket={t}/>
              ))}
            </div>
          </>
        )}
      </Body>
      <FAB icon={I.cam} label="Reportar incidencia" onClick={() => navigate('/housekeeping/report')}/>
    </PhoneScreen>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ padding: '0 18px 12px' }}>
      <div style={{
        height: 8, borderRadius: 999, background: 'var(--card-2)',
        border: '1px solid var(--line)', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          width: pct + '%', height: '100%', background: 'var(--forest)',
          borderRadius: 999, transition: 'width .3s',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
        <span>Avance del turno</span>
        <span className="hpj-mono">{pct}%</span>
      </div>
    </div>
  );
}

function TaskCard({ task, onClick }) {
  const { room, typeLabel, type, priority, sla, tags = [], status, progress, total } = task;
  const active = status === 'en-curso';
  const prioColor =
    priority === 'alta'  ? 'var(--danger)' :
    priority === 'media' ? 'var(--warn)'   :
    'var(--muted-2)';
  const hasAllergen = tags.includes('Sin frutos secos');

  return (
    <Card style={{ padding: 12, borderLeft: `3px solid ${prioColor}` }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: active ? 'var(--brass-soft)' : 'var(--forest-soft)',
          color: active ? 'var(--brass-deep)' : 'var(--forest-deep)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 600,
          textAlign: 'center', lineHeight: 1.1,
        }}>
          {room.length <= 4 ? room : room.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{typeLabel || type}</span>
            {active && <Pill kind="brass" style={{ height: 16, fontSize: 9 }}>EN CURSO</Pill>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            {sla && (
              <span className="hpj-mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{sla}</span>
            )}
            {hasAllergen && <Pill kind="danger" style={{ height: 16, fontSize: 9 }}>ALERGIA</Pill>}
          </div>
        </div>
        <Pill kind={priority === 'alta' ? 'danger' : priority === 'media' ? 'warn' : ''}
          style={{ height: 18, fontSize: 10, flexShrink: 0 }}>{(priority || 'baja').toUpperCase()}</Pill>
      </div>
      {active && total > 0 && (
        <div style={{ marginTop: 8, height: 3, borderRadius: 999, background: 'var(--card-2)', overflow: 'hidden' }}>
          <div style={{ width: ((progress || 0) / total * 100) + '%', height: '100%', background: 'var(--brass)' }}/>
        </div>
      )}
    </Card>
  );
}

const TICKET_STATUS = {
  abierto:  { label: 'ABIERTO',   kind: 'warn' },
  aceptado: { label: 'EN CURSO',  kind: 'info' },
  cerrado:  { label: 'RESUELTO',  kind: 'ok'   },
  pausado:  { label: 'PAUSADO',   kind: ''     },
};

const PRIORITY_COLOR = {
  alta:  'var(--danger)',
  media: 'var(--warn)',
  baja:  'var(--muted-2)',
};

function IncidentRow({ ticket }) {
  const { label, kind } = TICKET_STATUS[ticket.status] || { label: ticket.status, kind: '' };
  const prioColor = PRIORITY_COLOR[ticket.priority] || 'var(--muted-2)';

  return (
    <Card style={{ padding: '10px 12px', borderLeft: `3px solid ${prioColor}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ticket.category} — {ticket.desc}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {ticket.room}
            {ticket.reportedAt ? ` · ${ticket.reportedAt}` : ''}
          </div>
        </div>
        <Pill kind={kind} style={{ height: 18, fontSize: 9, flexShrink: 0 }}>{label}</Pill>
      </div>
    </Card>
  );
}

function DoneRow({ room, type, time }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 10,
      background: 'var(--card-2)', border: '1px solid var(--line-soft)',
      opacity: 0.85,
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 999, background: 'var(--ok-soft)',
        color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon size={14} d={<path d="M4 12l5 5L20 6"/>} sw={2}/></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13 }}><b style={{ fontWeight: 600 }}>Hab {room}</b> · {type}</div>
      </div>
      <span className="hpj-mono" style={{ fontSize: 11, color: 'var(--muted-2)' }}>{time}</span>
    </div>
  );
}
