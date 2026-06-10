// src/roles/sales/NewEvent.jsx — Crear nueva Orden de Evento.
// Al guardar llama addEvent() del store y navega al calendario.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, BackBtn,
} from '../../ui/shared.jsx';
import { useActions, useSalones } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';

export default function NewEvent() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { addEvent } = useActions();
  const SALONES = useSalones();

  const today = new Date().toISOString().slice(0, 10);

  const [name,      setName]      = useState('');
  const [date,      setDate]      = useState(today);
  const [time,      setTime]      = useState('19:00');
  const [salon,     setSalon]     = useState(SALONES[0]?.name || '');
  const [pax,       setPax]       = useState('');
  const [client,    setClient]    = useState('');
  const [menu,      setMenu]      = useState('');
  const [allergens, setAllergens] = useState('');
  const [notes,     setNotes]     = useState('');
  const [status,    setStatus]    = useState('borrador');

  const canSend = name.trim() && date && pax && parseInt(pax, 10) > 0;

  const send = () => {
    addEvent({
      name:      name.trim(),
      date,
      time,
      salon,
      pax:       parseInt(pax, 10),
      client:    client.trim() || null,
      menu:      menu.trim()   || null,
      allergens: allergens.trim() || null,
      notes:     notes.trim()  || null,
      status,
      created_by: user?.name || 'sales',
    });
    navigate('/sales');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        eyebrow="Nueva orden de evento"
        title="Crear evento"
        leading={<BackBtn label="Eventos"/>}
      />
      <Body style={{ paddingBottom: 96 }}>

        {/* Nombre */}
        <Section label="Nombre del evento">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Cena de gala · Congreso AMG"
            style={inputStyle}
          />
        </Section>

        {/* Fecha y hora */}
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
          <FieldBox label="Fecha">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, padding: 0 }}
            />
          </FieldBox>
          <FieldBox label="Hora">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...inputStyle, padding: 0 }}
            />
          </FieldBox>
        </div>

        {/* Salón */}
        <Section label="Salón">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SALONES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSalon(s.name)}
                style={{
                  padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                  background: salon === s.name ? 'var(--forest-soft)' : 'var(--card)',
                  border: `1.5px solid ${salon === s.name ? 'var(--forest)' : 'var(--line)'}`,
                  color: 'var(--ink)', fontFamily: 'inherit', fontSize: 13,
                  cursor: 'pointer', fontWeight: salon === s.name ? 600 : 400,
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </Section>

        {/* PAX — campo crítico */}
        <Section label="Comensales (pax)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="number"
              min="1"
              value={pax}
              onChange={(e) => setPax(e.target.value)}
              placeholder="0"
              style={{
                ...inputStyle,
                fontSize: 28,
                fontFamily: 'var(--serif)',
                width: 80,
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
              Este número se comparte con<br/>todas las áreas al confirmar.
            </span>
          </div>
        </Section>

        {/* Cliente */}
        <Section label="Cliente / contacto">
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Nombre o empresa"
            style={inputStyle}
          />
        </Section>

        {/* Menú */}
        <Section label="Menú">
          <textarea
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
            placeholder="Describe el menú, tiempos, estilo de servicio…"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </Section>

        {/* Alergenos */}
        <Section label="Alergenos">
          <input
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            placeholder="Ej. frutos secos en postre · mariscos"
            style={{ ...inputStyle, color: allergens ? 'var(--danger)' : 'var(--muted)' }}
          />
        </Section>

        {/* Notas */}
        <Section label="Notas para las áreas">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Setup, música en vivo, decoración especial…"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
        </Section>

        {/* Status */}
        <Section label="Estado inicial">
          <div style={{
            display: 'flex', padding: 3, borderRadius: 10,
            background: 'var(--card-2)',
          }}>
            {['borrador', 'confirmado'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                  background: status === s ? 'var(--card)' : 'transparent',
                  color:      status === s ? 'var(--ink)'  : 'var(--muted)',
                  borderRadius: 8, fontSize: 12, fontWeight: 500,
                  boxShadow:  status === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit', textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Acciones */}
        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, opacity: canSend ? 1 : 0.4 }}
            onClick={canSend ? send : undefined}
          >
            Crear y notificar áreas
          </button>
        </div>

      </Body>
    </PhoneScreen>
  );
}

// ── Helpers de layout ──────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div className="section-eyebrow" style={{ margin: '12px 0 6px' }}>{label}</div>
      {children}
    </div>
  );
}

function FieldBox({ label, children }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10,
      background: 'var(--card)', border: '1px solid var(--line)',
    }}>
      <div className="section-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px', fontSize: 14,
  borderRadius: 10, border: '1px solid var(--line)',
  background: 'var(--card)', fontFamily: 'inherit',
  color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
};
