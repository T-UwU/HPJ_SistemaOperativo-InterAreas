// src/roles/housekeeping/NewTask.jsx — Crear tarea de limpieza en área común o salón.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneScreen, BrandStrip, AppBar, Body, BackBtn } from '../../ui/shared.jsx';
import { useActions } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';
import { HOTEL_AREAS } from '../../lib/areas.js';

const TASK_TYPES = [
  { value: 'general',      label: 'Limpieza general' },
  { value: 'profunda',     label: 'Limpieza profunda' },
  { value: 'post-evento',  label: 'Post-evento' },
  { value: 'sanitizacion', label: 'Sanitización' },
  { value: 'reposicion',   label: 'Reposición' },
];

const SLA_OPTIONS = [
  'Antes de 10:00',
  'Antes de 12:00',
  'Antes de 14:00',
  'Sin urgencia',
];

export default function HousekeepingNewTask() {
  const navigate = useNavigate();
  const actions  = useActions();
  const user     = useCurrentUser();

  const [area,     setArea]     = useState('');
  const [type,     setType]     = useState('general');
  const [priority, setPriority] = useState('media');
  const [sla,      setSla]      = useState('Antes de 12:00');
  const [note,     setNote]     = useState('');

  const canSubmit = area !== '';

  function handleSubmit() {
    if (!canSubmit) return;
    const chosen    = TASK_TYPES.find((t) => t.value === type);
    const areaLabel = HOTEL_AREAS.find((a) => a.id === area)?.label || area;
    actions.addTask({
      room: areaLabel,   // reutilizamos el campo room para almacenar el área
      type,
      typeLabel: chosen?.label || type,
      priority,
      sla,
      note: note.trim() || null,
      createdBy: user?.name || 'Limpieza',
    });
    navigate('/housekeeping');
  }

  return (
    <PhoneScreen>
      <BrandStrip role="housekeeping"/>
      <AppBar title="Nueva tarea" eyebrow="Limpieza"/>
      <Body style={{ paddingBottom: 32 }}>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ marginTop: 4 }}>
            <BackBtn label="Tareas"/>
          </div>

          <Field label="Área o salón">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: area === '' ? 'var(--warn)' : 'var(--line)',
              }}
            >
              <option value="">Selecciona área…</option>
              {HOTEL_AREAS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
            {area === '' && (
              <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 4 }}>
                Selecciona el área a limpiar.
              </div>
            )}
          </Field>

          <Field label="Tipo de tarea">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TASK_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid',
                    borderColor: type === t.value ? 'var(--forest)' : 'var(--line)',
                    background: type === t.value ? 'var(--forest-soft)' : 'var(--card)',
                    color: type === t.value ? 'var(--forest-deep)' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Prioridad">
            <div style={{ display: 'flex', gap: 8 }}>
              {[['alta','var(--danger)','var(--danger-soft)'],['media','var(--warn)','#FFF8E1'],['baja','var(--muted-2)','var(--card-2)']].map(([p, col, bg]) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid',
                    borderColor: priority === p ? col : 'var(--line)',
                    background: priority === p ? bg : 'var(--card)',
                    color: priority === p ? col : 'var(--ink)',
                    cursor: 'pointer', fontWeight: priority === p ? 600 : 400,
                    textTransform: 'capitalize',
                  }}
                >{p}</button>
              ))}
            </div>
          </Field>

          <Field label="SLA">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SLA_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSla(s)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 12,
                    border: '1.5px solid',
                    borderColor: sla === s ? 'var(--ink-2)' : 'var(--line)',
                    background: sla === s ? 'var(--card-2)' : 'var(--card)',
                    color: 'var(--ink)', cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                  }}
                >{s}</button>
              ))}
            </div>
          </Field>

          <Field label="Nota (opcional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Instrucciones especiales, requerimientos del evento, etc."
              rows={3}
              style={{ ...selectStyle, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </Field>

          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 15, marginTop: 4, opacity: canSubmit ? 1 : 0.4 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Crear tarea
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
