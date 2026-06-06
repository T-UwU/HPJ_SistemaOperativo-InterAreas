// src/roles/reception/Arrivals.jsx — Lista de llegadas del día.
// Migrado de screens-reception.jsx::ReceptionArrivals.
// · Los chips de filtro son visuales por ahora (TODO: useState filter)
// · Card → /reception/guest/:id
// · Botón "Check-in" → /reception/checkin/:id

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow,
  Card, Avatar, Pill,
} from '../../ui/shared.jsx';
import { useArrivals, useRooms } from '../../store/data.js';

function liveRoomStatus(rooms, roomId) {
  const id = roomId?.split(' ')[0];
  const r = rooms.find((rm) => rm.id === id);
  if (!r) return { kind: 'info', label: 'Programada' };
  if (r.status === 'limpia')    return { kind: 'ok',     label: 'Lista' };
  if (r.status === 'sucia')     return { kind: 'warn',   label: 'En limpieza' };
  if (r.status === 'checkout')  return { kind: 'warn',   label: 'En salida' };
  if (r.status === 'bloqueada') return { kind: 'danger', label: 'Bloqueada' };
  if (r.status === 'ocupada')   return { kind: 'ok',     label: 'Ocupada' };
  return { kind: 'info', label: 'Programada' };
}

export default function ReceptionArrivals() {
  const navigate = useNavigate();
  const arrivals = useArrivals();
  const [filter, setFilter] = useState('todas');

  const filters = [
    { id: 'todas',     label: 'Todas',     count: arrivals.length },
    { id: 'pending',   label: 'Pendientes', count: arrivals.filter(a => !a.done).length },
    { id: 'vip',       label: 'VIP',        count: arrivals.filter(a => a.vip).length },
  ];

  const visible = arrivals.filter((a) => {
    if (filter === 'pending') return !a.done;
    if (filter === 'vip')     return a.vip;
    return true;
  });

  const pending = visible.filter((a) => !a.done);
  const arrived = visible.filter((a) => a.done);

  return (
    <PhoneScreen>
      <BrandStrip role="reception"/>
      <AppBar
        eyebrow={`${arrivals.length} reservas · ${arrivals.filter(a => !a.done).length} pendientes`}
        title="Llegadas hoy"
      />
      <div style={{ padding: '4px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`pill ${filter === f.id ? 'pill-forest' : ''}`}
            style={{ whiteSpace: 'nowrap', border: 'none', cursor: 'pointer' }}
          >
            {f.label} {f.count > 0 && f.id !== 'todas' && f.count}
          </button>
        ))}
      </div>
      <Body style={{ paddingBottom: 80 }}>
        {pending.length > 0 && (
          <>
            <Eyebrow>Por llegar</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pending.map((a) => (
                <ArrivalCard
                  key={a.id}
                  arrival={a}
                  onOpen={() => navigate(`/reception/guest/${a.id}`)}
                  onCheckIn={() => navigate(`/reception/checkin/${a.id}`)}
                />
              ))}
            </div>
          </>
        )}
        {arrived.length > 0 && (
          <>
            <Eyebrow>Ya llegaron</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {arrived.map((a) => (
                <ArrivalCard key={a.id} arrival={a} done onOpen={() => navigate(`/reception/guest/${a.id}`)}/>
              ))}
            </div>
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}

function ArrivalCard({ arrival, onOpen, onCheckIn, done }) {
  const rooms = useRooms();
  const { guest, vip, room, plan, time } = arrival;
  const { kind, label } = liveRoomStatus(rooms, room);
  return (
    <Card style={{ padding: 12, opacity: done ? 0.55 : 1 }} onClick={onOpen}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name={guest} size={40}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guest}</span>
            {vip && <span style={{ fontFamily: 'var(--serif)', fontSize: 11, color: 'var(--brass-deep)', letterSpacing: '0.2em' }}>VIP</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Hab {room} · {plan}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <span className="hpj-mono" style={{ fontSize: 13 }}>{time}</span>
          <Pill kind={kind} style={{ height: 18, fontSize: 10 }}>{label}</Pill>
        </div>
      </div>
      {!done && (
        <button
          onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 10, fontSize: 13 }}
        >
          Check-in
        </button>
      )}
    </Card>
  );
}
