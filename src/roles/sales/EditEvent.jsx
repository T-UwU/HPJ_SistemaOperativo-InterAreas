// src/roles/sales/EditEvent.jsx — Editar una orden de evento existente.

import React, { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, BackBtn,
} from '../../ui/shared.jsx';
import { useEvents, useActions, useSalones } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';

const STATUSES = ['borrador', 'confirmado', 'cerrado'];

export default function EditEvent() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const user     = useCurrentUser();
  const events   = useEvents();
  const { updateEvent } = useActions();
  const SALONES  = useSalones();

  const event = events.find((e) => e.id === id);
  if (!event) return <Navigate to="/sales" replace />;

  const [name,      setName]      = useState(event.name      || '');
  const [date,      setDate]      = useState(event.date      || '');
  const [time,      setTime]      = useState(event.time      || '19:00');
  const [salon,     setSalon]     = useState(event.salon     || SALONES[0]?.name || '');
  const [pax,       setPax]       = useState(event.pax       || 50);
  const [client,    setClient]    = useState(event.client    || '');
  const [menu,      setMenu]      = useState(event.menu      || '');
  const [allergens, setAllergens] = useState(event.allergens || '');
  const [notes,     setNotes]     = useState(event.notes     || '');
  const [status,    setStatus]    = useState(event.status    || 'borrador');

  const canSave = name.trim() && date && pax && parseInt(pax, 10) > 0;

  const save = () => {
    if (!canSave) return;
    updateEvent(id, {
      name:      name.trim(),
      date,
      time,
      salon,
      pax:       parseInt(pax, 10),
      client:    client.trim()    || null,
      menu:      menu.trim()      || null,
      allergens: allergens.trim() || null,
      notes:     notes.trim()     || null,
      status,
    });
    navigate('/sales');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        eyebrow="Editar orden de evento"
        title={event.name}
        leading={<BackBtn label="Evento"/>}
      />
      <Body style={{ paddingBottom: 96 }}>

        <Section label="Nombre del evento">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </Section>

        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
          <FieldBox label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, padding: 0 }}/>
          </FieldBox>
          <FieldBox label="Hora">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ ...inputStyle, padding: 0 }}/>
          </FieldBox>
        </div>

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

        <Section label="Comensales (pax)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="number" min="1"
              value={pax}
              onChange={(e) => setPax(e.target.value)}
              style={{ ...inputStyle, fontSize: 28, fontFamily: 'var(--serif)', width: 80, textAlign: 'center' }}
            />
            <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
              Este número se comparte con<br/>todas las áreas.
            </span>
          </div>
        </Section>

        <Section label="Cliente / contacto">
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nombre o empresa" style={inputStyle}/>
        </Section>

        <Section label="Menú">
          <textarea value={menu} onChange={(e) => setMenu(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}/>
        </Section>

        <Section label="Alergenos">
          <input
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            placeholder="Ej. frutos secos · mariscos"
            style={{ ...inputStyle, color: allergens ? 'var(--danger)' : 'var(--muted)' }}
          />
        </Section>

        <Section label="Notas para las áreas">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}/>
        </Section>

        <Section label="Estado">
          <div style={{ display: 'flex', padding: 3, borderRadius: 10, background: 'var(--card-2)' }}>
            {STATUSES.map((s) => (
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

        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, opacity: canSave ? 1 : 0.4 }}
            disabled={!canSave}
            onClick={save}
          >
            Guardar cambios
          </button>
        </div>

      </Body>
    </PhoneScreen>
  );
}

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
    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--line)' }}>
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
