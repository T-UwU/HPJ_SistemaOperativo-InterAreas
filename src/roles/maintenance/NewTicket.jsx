// src/roles/maintenance/NewTicket.jsx — Crear ticket de mantenimiento.
// Soporta habitaciones y áreas comunes / salones.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, BackBtn,
} from '../../ui/shared.jsx';
import { useActions, useRooms, useAreas } from '../../store/data.js';
import { TICKET_CATEGORIES } from '../../ui/categoryIcons.jsx';
import { useCurrentUser } from '../../store/auth.js';

const CATEGORIES = TICKET_CATEGORIES;

const PRIORITIES = ['baja', 'media', 'alta'];
const SLA_MAP    = { alta: '01:00', media: '04:00', baja: '24:00' };

export default function MaintenanceNewTicket() {
  const navigate       = useNavigate();
  const rooms          = useRooms();
  const { addTicket }  = useActions();
  const user           = useCurrentUser();
  const HOTEL_AREAS    = useAreas();

  const [locType,  setLocType]  = useState('habitacion'); // 'habitacion' | 'area'
  const [room,     setRoom]     = useState('');
  const [area,     setArea]     = useState('');
  const [category, setCategory] = useState('plomeria');
  const [priority, setPriority] = useState('media');
  const [desc,     setDesc]     = useState('');

  const location   = locType === 'habitacion' ? room : area;
  const canSubmit  = location !== '' && desc.trim() !== '';

  const send = () => {
    if (!canSubmit) return;
    const cat      = CATEGORIES.find((c) => c.id === category);
    const locLabel = locType === 'habitacion'
      ? location
      : HOTEL_AREAS.find((a) => a.id === location)?.label || location;

    addTicket({
      room: locLabel,
      category: cat.label,
      desc: desc.trim(),
      reportedBy: 'maintenance',
      reporter: user?.name || 'Mantenimiento',
      sla: SLA_MAP[priority],
      status: 'abierto',
      priority,
      reportedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    });
    navigate('/maintenance');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="maintenance"/>
      <AppBar eyebrow="Mantenimiento" title="Nuevo ticket"/>
      <Body style={{ paddingBottom: 32 }}>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ marginTop: 4 }}>
            <BackBtn label="Tickets"/>
          </div>

          {/* Selector tipo de ubicación */}
          <Field label="Ubicación">
            <div style={{
              display: 'flex', padding: 3, borderRadius: 10,
              background: 'var(--card-2)',
            }}>
              {[['habitacion','Habitación'],['area','Área / Salón']].map(([val, lbl]) => (
                <button key={val} onClick={() => { setLocType(val); setRoom(''); setArea(''); }} style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                  background: locType === val ? 'var(--card)' : 'transparent',
                  color:      locType === val ? 'var(--ink)'  : 'var(--muted)',
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  boxShadow: locType === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit',
                }}>{lbl}</button>
              ))}
            </div>

            {locType === 'habitacion' ? (
              <select value={room} onChange={(e) => setRoom(e.target.value)} style={selectStyle}>
                <option value="">Selecciona habitación…</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} · Piso {r.floor} · {r.type}
                    {r.guest ? ` (${r.guest})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <select value={area} onChange={(e) => setArea(e.target.value)} style={selectStyle}>
                <option value="">Selecciona área…</option>
                {HOTEL_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            )}
          </Field>

          <Field label="Categoría">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: 12, borderRadius: 12,
                    background: category === c.id ? '#3A2722' : 'var(--card)',
                    border: `1.5px solid ${category === c.id ? '#3A2722' : 'var(--line)'}`,
                    color: category === c.id ? '#fff' : 'var(--ink)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <span style={{ color: category === c.id ? 'var(--brass-soft)' : 'var(--brass-deep)' }}>
                    {c.icon}
                  </span>
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Prioridad">
            <div style={{
              display: 'flex', padding: 3, borderRadius: 10,
              background: 'var(--card-2)',
            }}>
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriority(p)} style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                  background: priority === p ? 'var(--card)' : 'transparent',
                  color:      priority === p ? 'var(--ink)'  : 'var(--muted)',
                  borderRadius: 8, fontSize: 12, fontWeight: 500,
                  boxShadow: priority === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit', textTransform: 'capitalize',
                }}>{p}</button>
              ))}
            </div>
          </Field>

          <Field label="Descripción">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe el problema con detalle…"
              rows={4}
              style={{ ...selectStyle, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </Field>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2, opacity: canSubmit ? 1 : 0.4 }}
              disabled={!canSubmit}
              onClick={send}
            >
              Crear ticket
            </button>
          </div>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.03em' }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

const selectStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid var(--line)', background: 'var(--card)',
  color: 'var(--ink)', fontSize: 14, outline: 'none',
};
