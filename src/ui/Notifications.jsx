// src/ui/Notifications.jsx — Feed de actividad cruzada compartido entre roles.

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, BackBtn, Body, Eyebrow, Card,
} from './shared.jsx';
import { useActivity } from '../store/activity.js';
import { useCurrentUser } from '../store/auth.js';

const ROLE_COLOR = {
  reception:    'var(--brass)',
  housekeeping: 'var(--info)',
  sales:        '#7C5F8A',
  maintenance:  'var(--danger)',
  purchasing:   'var(--forest)',
};

const ROLE_LABEL = {
  reception:    'Recepción',
  housekeeping: 'Limpieza',
  sales:        'Ventas',
  maintenance:  'Mantenimiento',
  purchasing:   'Compras',
};

export default function Notifications() {
  const navigate  = useNavigate();
  const user      = useCurrentUser();
  const events    = useActivity((s) => s.events);
  const markRead  = useActivity((s) => s.markRead);
  const lastRead  = useActivity((s) => s.lastReadAt);

  const roleId = user?.roleId;

  useEffect(() => {
    if (roleId) markRead(roleId);
  }, [roleId]);

  const ts    = roleId ? lastRead?.[roleId] : null;
  const since = ts ? new Date(ts) : new Date(Date.now() - 1000);

  return (
    <PhoneScreen>
      <BrandStrip role={user?.roleId || 'reception'}/>
      <AppBar
        title="Actividad"
        leading={<BackBtn label=""/>}
      />
      <Body style={{ paddingBottom: 24 }}>
        {events.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Sin actividad reciente.
          </div>
        ) : (
          <>
            <Eyebrow>Recientes</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map((ev) => {
                const isNew = new Date(ev.created_at) > since && ev.role !== user?.roleId;
                return <ActivityItem key={ev.id} ev={ev} isNew={isNew}/>;
              })}
            </div>
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}

function ActivityItem({ ev, isNew }) {
  const color = ROLE_COLOR[ev.role] || 'var(--ink-3)';
  const label = ROLE_LABEL[ev.role] || ev.role;
  const time  = new Date(ev.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card style={{ padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{
        width: 8, height: 8, borderRadius: 2, background: color,
        marginTop: 4, flexShrink: 0,
      }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, lineHeight: 1.45 }}>
          <b style={{ fontWeight: 600, color }}>{label}</b>
          {' · '}
          {ev.action}
          {ev.room && <span style={{ color: 'var(--muted)' }}> · Hab {ev.room}</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{time}</div>
      </div>
      {isNew && (
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--danger)', flexShrink: 0, marginTop: 5,
        }}/>
      )}
    </Card>
  );
}
