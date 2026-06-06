// src/roles/reception/Checkouts.jsx — Lista de checkouts del día.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Card, Avatar, Pill, BackBtn,
} from '../../ui/shared.jsx';
import { useRooms, useArrivals } from '../../store/data.js';

export default function ReceptionCheckouts() {
  const navigate = useNavigate();
  const rooms    = useRooms();
  const arrivals = useArrivals();

  const pending  = rooms.filter((r) => r.status === 'checkout');
  const cleaning = rooms.filter((r) => r.status === 'sucia');

  return (
    <PhoneScreen>
      <BrandStrip role="reception"/>
      <AppBar
        eyebrow={`${pending.length + cleaning.length} checkouts · ${pending.length} pendiente${pending.length !== 1 ? 's' : ''}`}
        title="Checkouts hoy"
        leading={<BackBtn label=""/>}
      />
      <Body style={{ paddingBottom: 80 }}>
        {pending.length === 0 && cleaning.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Sin checkouts pendientes.
          </div>
        )}

        {pending.length > 0 && (
          <>
            <Eyebrow>Pendiente de checkout</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pending.map((r) => (
                <CheckoutCard
                  key={r.id} room={r}
                  guestName={r.guest || arrivals.find((a) => a.room === r.id)?.guest || null}
                  onClick={() => navigate(`/reception/guest/${r.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {cleaning.length > 0 && (
          <>
            <Eyebrow>En limpieza</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cleaning.map((r) => (
                <CheckoutCard
                  key={r.id} room={r} done
                  guestName={r.guest || arrivals.find((a) => a.room === r.id)?.guest || null}
                  onClick={() => navigate(`/reception/guest/${r.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}

function CheckoutCard({ room, guestName, done, onClick }) {
  return (
    <Card style={{ padding: 12, opacity: done ? 0.6 : 1 }} onClick={onClick}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name={guestName || `Hab ${room.id}`} size={40}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {guestName || <span style={{ color: 'var(--muted)' }}>Sin nombre</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Hab {room.id} · {room.type} · Piso {room.floor}
          </div>
        </div>
        <Pill kind={done ? 'warn' : 'info'} style={{ height: 20, fontSize: 10, flexShrink: 0 }}>
          {done ? 'En limpieza' : 'Pendiente'}
        </Pill>
      </div>
      {!done && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 10, fontSize: 13 }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Hacer checkout →
        </button>
      )}
    </Card>
  );
}
