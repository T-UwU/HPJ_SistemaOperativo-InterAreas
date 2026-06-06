// src/roles/sales/NewReservation.jsx — Cotización de reserva de salón.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Card, KV, BackBtn,
} from '../../ui/shared.jsx';
import { useActions } from '../../store/data.js';

export const SALONES_VENTAS = [
  { id: 'salon-versalles', label: 'Salón Versalles',    cap: 500 },
  { id: 'salon-jardin',    label: 'Salón Jardín',       cap: 300 },
  { id: 'salon-terraza',   label: 'Salón Terraza',      cap: 150 },
  { id: 'sala-ejecutiva',  label: 'Sala Ejecutiva',     cap: 40  },
];

const EVENT_TYPES = [
  { id: 'boda',        label: 'Boda' },
  { id: 'xv',         label: 'XV Años' },
  { id: 'corporativo', label: 'Corporativo' },
  { id: 'graduacion',  label: 'Graduación' },
  { id: 'social',      label: 'Social' },
  { id: 'otro',        label: 'Otro' },
];

const CHANNELS = [
  { id: 'directo',   label: 'Directo' },
  { id: 'agencia',   label: 'Agencia' },
  { id: 'referido',  label: 'Referido' },
  { id: 'digital',   label: 'Digital' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SalesNewReservation() {
  const navigate = useNavigate();
  const { addReservation } = useActions();

  const today = new Date().toISOString().slice(0, 10);

  const [client,    setClient]    = useState('');
  const [contact,   setContact]   = useState('');
  const [eventType, setEventType] = useState('boda');
  const [salonId,   setSalonId]   = useState('salon-versalles');
  const [date,      setDate]      = useState(today);
  const [time,      setTime]      = useState('19:00');
  const [pax,       setPax]       = useState(100);
  const [duration,  setDuration]  = useState(6);
  const [channel,   setChannel]   = useState('directo');
  const [amount,    setAmount]    = useState('');
  const [notes,     setNotes]     = useState('');

  const salon      = SALONES_VENTAS.find((s) => s.id === salonId) || SALONES_VENTAS[0];
  const evTypLabel = EVENT_TYPES.find((e) => e.id === eventType)?.label || eventType;
  const chanLabel  = CHANNELS.find((c) => c.id === channel)?.label || channel;
  const parsedAmt  = parseFloat(amount.replace(/,/g, '')) || 0;
  const taxes      = Math.round(parsedAmt * 0.16);
  const total      = parsedAmt + taxes;

  const canConfirm = client.trim() !== '' && date !== '' && pax > 0 && parsedAmt > 0;

  const confirm = () => {
    if (!canConfirm) return;
    addReservation({
      guestName:  client.trim(),
      channel:    chanLabel,
      stay:       `${fmtDate(date)} · ${time} · ${duration}h`,
      checkIn:    date,
      checkOut:   date,
      nights:     0,
      room:       salon.label,
      roomType:   evTypLabel,
      plan:       `${pax} pax`,
      amount:     total,
      status:     'por-confirmar',
      vip:        pax >= 200,
      group:      pax >= 50,
      today:      date === today,
    });
    navigate('/sales');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        eyebrow="Nueva cotización"
        title="Reserva de salón"
        leading={<BackBtn label=""/>}
      />
      <Body style={{ paddingBottom: 96 }}>
        <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

          <Field label="Nombre del cliente">
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Nombre o empresa…"
              autoFocus
              style={inputStyle}
            />
          </Field>

          <Field label="Contacto (opcional)">
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Tel, email o WhatsApp"
              style={inputStyle}
            />
          </Field>
        </div>

        <Eyebrow>Tipo de evento</Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EVENT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setEventType(t.id)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 500, border: '1.5px solid',
                borderColor: eventType === t.id ? 'var(--forest)' : 'var(--line)',
                background:  eventType === t.id ? 'var(--forest-soft)' : 'var(--card)',
                color:       eventType === t.id ? 'var(--forest-deep)' : 'var(--ink-3)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Eyebrow>Salón</Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SALONES_VENTAS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSalonId(s.id)}
              style={{
                padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                background: salonId === s.id ? 'var(--forest-soft)' : 'var(--card)',
                border: `1.5px solid ${salonId === s.id ? 'var(--forest)' : 'var(--line)'}`,
                color: 'var(--ink)', fontFamily: 'inherit', fontSize: 13,
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: salonId === s.id ? 600 : 400 }}>{s.label}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>cap. {s.cap}</span>
            </button>
          ))}
        </div>

        <Eyebrow>Fecha y hora</Eyebrow>
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle}/>
          </Field>
          <Field label="Hora inicio">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle}/>
          </Field>
        </div>

        <Eyebrow>Evento</Eyebrow>
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Pax">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setPax(Math.max(1, pax - 10))} style={stepBtn}>−</button>
              <span className="hpj-serif" style={{ fontSize: 22, minWidth: 36, textAlign: 'center' }}>{pax}</span>
              <button onClick={() => setPax(pax + 10)} style={stepBtn}>+</button>
            </div>
          </Field>
          <Field label="Duración (h)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setDuration(Math.max(1, duration - 1))} style={stepBtn}>−</button>
              <span className="hpj-serif" style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>{duration}</span>
              <button onClick={() => setDuration(duration + 1)} style={stepBtn}>+</button>
            </div>
          </Field>
        </div>

        <Eyebrow>Canal</Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', gap: 6 }}>
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChannel(c.id)}
              className={`pill ${channel === c.id ? 'pill-dark' : ''}`}
              style={{ flex: 1, justifyContent: 'center', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <Eyebrow>Cotización</Eyebrow>
        <div style={{ padding: '0 16px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', flexShrink: 0 }}>MXN</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ ...inputStyle, fontSize: 22, fontFamily: 'var(--serif)', textAlign: 'right' }}
            />
          </div>
          {parsedAmt > 0 && (
            <Card style={{ padding: 12 }}>
              <KV k="Subtotal"     v={`MXN ${parsedAmt.toLocaleString('es-MX')}`}/>
              <KV k="IVA (16%)"   v={`MXN ${taxes.toLocaleString('es-MX')}`}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="hpj-serif" style={{ fontSize: 20 }}>MXN {total.toLocaleString('es-MX')}</span>
              </div>
            </Card>
          )}
        </div>

        <div style={{ padding: '8px 16px 0' }}>
          <Field label="Notas (opcional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Requerimientos especiales, decoración, catering, montaje…"
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
            />
          </Field>
        </div>

        <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, opacity: canConfirm ? 1 : 0.4 }}
            disabled={!canConfirm}
            onClick={confirm}
          >
            Crear cotización
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid var(--line)', background: 'var(--card)',
  color: 'var(--ink)', fontSize: 14, outline: 'none',
  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
};

const stepBtn = {
  width: 32, height: 32, borderRadius: 8,
  border: '1.5px solid var(--line)', background: 'var(--card)',
  fontSize: 18, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  color: 'var(--ink)', fontFamily: 'inherit',
};
