// src/roles/reception/GuestDetail.jsx — Timeline + acciones rápidas.
// Migrado de screens-reception.jsx::ReceptionGuestDetail.
// · Recibe :guestId que puede ser el id de la arrival O el id de un room
//   (ambos resuelven al detalle de la habitación correspondiente).
// · Los chips de status se derivan del arrival si existe.

import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  PhoneScreen, Body, Card, Pill, Avatar, BackBtn,
} from '../../ui/shared.jsx';
import { useArrivals, useRooms, useActions } from '../../store/data.js';
import { useEvidence } from '../../store/evidence.js';

export default function ReceptionGuestDetail() {
  const { guestId } = useParams();
  const navigate = useNavigate();
  const arrivals = useArrivals();
  const rooms    = useRooms();
  const actions  = useActions();
  const evidence = useEvidence((s) => s.byRoom);

  // Resolve por arrival-id (desde lista de llegadas) o room-id (desde grid de habs)
  const arrivalById   = arrivals.find((a) => a.id === guestId);
  const arrivalByRoom = arrivals.find((a) => a.room === guestId || a.room.startsWith(guestId + ' '));
  const arrival = arrivalById || arrivalByRoom;
  const room    = arrival
    ? rooms.find((r) => r.id === arrival.room.split(' ')[0])
    : rooms.find((r) => r.id === guestId);

  if (!arrival && !room) return <Navigate to="/reception/rooms" replace />;

  const guestName  = arrival?.guest || room?.guest || null;
  const roomId     = arrival?.room || room?.id;
  const stayLine   = arrival?.stay  || (room ? `${room.type} · Piso ${room.floor}` : '—');
  const planLine   = arrival?.plan  || null;
  const roomEvidence = room ? evidence[room.id] : null;

  return (
    <PhoneScreen>
      <div style={{ padding: '12px 18px 0' }}>
        <BackBtn label={`Habitaciones · ${roomId}`} />
      </div>
      <div style={{ padding: '8px 18px 14px' }}>
        <div className="hpj-serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.1 }}>
          Hab. {roomId}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          {room?.status === 'sucia'     && <Pill kind="warn">En limpieza</Pill>}
          {room?.status === 'checkout'  && <Pill kind="warn">En salida</Pill>}
          {room?.status === 'bloqueada' && <Pill kind="danger">Bloqueada</Pill>}
          {(arrival?.vip || room?.vipPending) && <Pill kind="brass">VIP</Pill>}
        </div>
      </div>

      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={guestName || roomId} size={44} tone={guestName ? 'brass' : undefined}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>
                {guestName || <span style={{ color: 'var(--muted)' }}>Sin huésped</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{stayLine}</div>
              {planLine && (
                <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 1 }}>{planLine}</div>
              )}
            </div>
          </Card>

          {roomEvidence && roomEvidence.photos.length > 0 && (
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--ink-2)' }}>
                Evidencia de limpieza
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                {roomEvidence.photos.map((src, i) => (
                  <img
                    key={i} src={src} alt={`Evidencia ${i + 1}`}
                    style={{ width: 88, height: 66, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                {new Date(roomEvidence.at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · Limpieza
              </div>
            </Card>
          )}

          {arrival && !arrival.done && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: 14 }}
              onClick={() => navigate(`/reception/checkin/${arrival.id}`)}
            >
              Check-in
            </button>
          )}

          {(room?.status === 'checkout' || room?.status === 'ocupada') && (
            <button
              className="btn"
              style={{ width: '100%', fontSize: 14, background: 'var(--forest-soft)', color: 'var(--forest-deep)', border: '1.5px solid var(--forest)' }}
              onClick={() => {
                actions.checkOut(room.id, guestName);
                navigate('/reception/rooms');
              }}
            >
              Checkout → limpiar habitación
            </button>
          )}
        </div>
      </Body>
    </PhoneScreen>
  );
}
