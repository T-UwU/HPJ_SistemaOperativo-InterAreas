// src/roles/sales/ReservationDetail.jsx — Detalle de reserva con acción de confirmación.

import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Card, Pill, KV, BackBtn,
} from '../../ui/shared.jsx';
import { useReservations, useActions } from '../../store/data.js';

const STATUS_MAP = {
  'confirmada':    { kind: 'ok',   label: 'Confirmada' },
  'por-confirmar': { kind: 'warn', label: 'Por confirmar' },
  'seguimiento':   { kind: 'info', label: 'Seguimiento' },
};

export default function SalesReservationDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const reservations = useReservations();
  const { confirmReservation } = useActions();

  const res = reservations.find((r) => r.id === id);
  if (!res) return <Navigate to="/sales" replace />;

  const s = STATUS_MAP[res.status] || { kind: '', label: res.status };

  const handleConfirm = () => {
    confirmReservation(res.id);
    navigate('/sales');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        eyebrow={`Reserva · ${res.id}`}
        title={res.guestName}
        trailing={<Pill kind={s.kind}>{s.label}</Pill>}
      />
      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '0 16px' }}>
          <div style={{ marginBottom: 12 }}>
            <BackBtn label="Reservas"/>
          </div>
        </div>

        <Eyebrow>Detalle de la reserva</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <Card style={{ padding: 14 }}>
            <KV k="Huésped"   v={res.guestName} vbold/>
            <KV k="Canal"     v={res.channel}/>
            <KV k="Habitación" v={`${res.room} · ${res.roomType}`}/>
            <KV k="Estancia"  v={res.stay}/>
            <KV k="Plan"      v={res.plan}/>
            <KV k="Check-in"  v={res.checkIn}/>
            <KV k="Check-out" v={res.checkOut}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Total</span>
              <span className="hpj-serif" style={{ fontSize: 18, fontWeight: 500 }}>
                MXN {res.amount.toLocaleString('es-MX')}
              </span>
            </div>
          </Card>
        </div>

        {res.status === 'por-confirmar' && (
          <>
            <Eyebrow>Acción requerida</Eyebrow>
            <div style={{ padding: '0 16px' }}>
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'var(--warn-soft)', border: '1px solid var(--warn)',
                fontSize: 13, color: 'var(--ink-2)', marginBottom: 10,
              }}>
                Esta reserva aún no está confirmada. Verifica disponibilidad y confirma para bloquear la habitación.
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleConfirm}>
                Confirmar reserva →
              </button>
            </div>
          </>
        )}

        {res.status === 'seguimiento' && (
          <>
            <Eyebrow>En seguimiento</Eyebrow>
            <div style={{ padding: '0 16px' }}>
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: 'var(--card-2)', border: '1px solid var(--line)',
                fontSize: 13, color: 'var(--ink-2)',
              }}>
                Reserva en proceso de seguimiento. Continúa el contacto con el cliente para cerrar la venta.
              </div>
            </div>
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}
