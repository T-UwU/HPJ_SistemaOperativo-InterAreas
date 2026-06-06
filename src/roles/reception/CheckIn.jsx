// src/roles/reception/CheckIn.jsx — Flujo de check-in.
// Migrado de screens-reception.jsx::ReceptionCheckIn.
// · Lee la llegada por :id del store
// · "Confirmar check-in" → markArrived() + navega a Llegadas
// · TODO: persistir preferencias/notificaciones reales

import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  PhoneScreen, Body, Eyebrow, Card, Pill, Avatar, KV, RoleChip, BackBtn,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useArrivals, useActions } from '../../store/data.js';

export default function ReceptionCheckIn() {
  const { guestId } = useParams();
  const navigate = useNavigate();
  const arrivals = useArrivals();
  const { markArrived } = useActions();

  const arrival = arrivals.find((a) => a.id === guestId);
  if (!arrival) return <Navigate to="/reception/arrivals" replace />;

  const confirm = () => {
    markArrived(arrival.id);
    navigate('/reception/arrivals');
  };

  // Datos de reserva derivados de la llegada (mock — el resto en TODO).
  return (
    <PhoneScreen>
      <div style={{
        padding: '12px 18px 14px',
        background: 'var(--forest-deep)', color: 'var(--bg)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <BackBtn label="Atrás" />
          <span className="hpj-mark" style={{ color: 'var(--brass-soft)', fontSize: 10 }}>HPJ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <Avatar name={arrival.guest} size={56} tone="brass"/>
          <div style={{ flex: 1 }}>
            {arrival.vip && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--brass)' }}>
                  VIP · CLUB JULIO
                </span>
              </div>
            )}
            <div className="hpj-serif" style={{ fontSize: 24, marginTop: 2 }}>{arrival.guest}</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Llegada {arrival.time}{arrival.plan ? ` · ${arrival.plan.split(' · ')[0]}` : ''}</div>
          </div>
        </div>
      </div>

      <Body style={{ paddingBottom: 80 }}>
        <Eyebrow>Reserva</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <Card style={{ padding: 14 }}>
            <KV k="Habitación" v={arrival.plan ? `${arrival.room} · ${arrival.plan.split(' · ')[0]}` : arrival.room} vbold/>
            <KV k="Llegada" v={arrival.time}/>
            <KV k="Estancia" v={arrival.stay}/>
            <KV k="Plan" v={arrival.plan} vbold/>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Garantía</span>
              <span><Pill kind="ok">Tarjeta · 4242</Pill></span>
            </div>
          </Card>
        </div>

        <Eyebrow>Al confirmar check-in se avisa a</Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NotifyRow role="housekeeping" text={`Limpieza · revisión final hab. ${arrival.room}`}/>
          <NotifyRow role="sales" text="Ventas · check-in confirmado en CRM"/>
        </div>

        <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>Atrás</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirm}>
            Confirmar check-in →
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function NotifyRow({ role, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10,
    }}>
      <RoleChip role={role}/>
      <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-2)' }}>{text}</div>
      <span style={{ color: 'var(--ok)' }}>{I.check}</span>
    </div>
  );
}
