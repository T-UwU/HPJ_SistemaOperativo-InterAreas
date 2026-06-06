// src/roles/purchasing/NewRequisition.jsx — Formulario para crear una requisición.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, BackBtn, Body,
} from '../../ui/shared.jsx';
import { useActions } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';

const AREAS = [
  { id: 'maintenance',  label: 'Mantenimiento' },
  { id: 'housekeeping', label: 'Limpieza' },
  { id: 'reception',    label: 'Recepción' },
  { id: 'purchasing',   label: 'Compras (interno)' },
];

const CATEGORIES = [
  { id: 'insumo',      label: 'Insumo' },
  { id: 'material',    label: 'Material' },
  { id: 'herramienta', label: 'Herramienta' },
  { id: 'servicio',    label: 'Servicio' },
  { id: 'otro',        label: 'Otro' },
];

const PRIORITIES = [
  { id: 'urgente',       label: 'Urgente',   color: 'var(--danger)' },
  { id: 'normal',        label: 'Normal',    color: 'var(--brass)' },
  { id: 'puede-esperar', label: 'Sin prisa', color: 'var(--muted)' },
];

export default function NewRequisition() {
  const navigate = useNavigate();
  const user     = useCurrentUser();
  const { addRequisition } = useActions();

  const [area,     setArea]     = useState('maintenance');
  const [item,     setItem]     = useState('');
  const [qty,      setQty]      = useState('1');
  const [category, setCategory] = useState('insumo');
  const [priority, setPriority] = useState('normal');
  const [notes,    setNotes]    = useState('');

  const send = () => {
    if (!item.trim()) return;
    addRequisition({
      area,
      item: item.trim(),
      qty: parseInt(qty, 10) || 1,
      category,
      priority,
      notes: notes.trim() || undefined,
      requestedBy: user?.name || 'Compras',
    });
    navigate('/purchasing');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="purchasing"/>
      <AppBar
        eyebrow="Crear pedido"
        title="Nueva requisición"
        leading={<BackBtn label=""/>}
      />
      <Body style={{ paddingBottom: 96 }}>
        <div style={{ padding: '8px 16px 0' }}>

          <Label>Área solicitante</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {AREAS.map((a) => (
              <button key={a.id} onClick={() => setArea(a.id)} style={{
                padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                background: area === a.id ? 'var(--forest-soft)' : 'var(--card)',
                border: `1.5px solid ${area === a.id ? 'var(--forest)' : 'var(--line)'}`,
                fontSize: 13, fontFamily: 'inherit', color: 'inherit', cursor: 'pointer',
              }}>{a.label}</button>
            ))}
          </div>

          <Label top>Artículo / insumo</Label>
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Ej. Sello universal 3&quot; plomería"
            className="card"
            style={{ width: '100%', padding: 12, fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)', border: '1px solid var(--line)', outline: 'none' }}
          />

          <Label top>Cantidad</Label>
          <input
            type="number" min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="card"
            style={{ width: '100%', padding: 12, fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)', border: '1px solid var(--line)', outline: 'none' }}
          />

          <Label top>Categoría</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  padding: '7px 13px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 500, border: '1.5px solid',
                  borderColor: category === c.id ? 'var(--brass)' : 'var(--line)',
                  background: category === c.id ? 'var(--brass)' : 'var(--card)',
                  color: category === c.id ? 'var(--bg)' : 'var(--ink-3)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <Label top>Prioridad</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                style={{
                  flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 12,
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                  border: '1.5px solid',
                  borderColor: priority === p.id ? p.color : 'var(--line)',
                  background: priority === p.id ? p.color + '18' : 'var(--card)',
                  color: priority === p.id ? p.color : 'var(--ink-3)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Label top>Notas (opcional)</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Especificaciones, marca preferida, urgencia adicional…"
            rows={3}
            style={{
              width: '100%', padding: 12, fontSize: 13, fontFamily: 'inherit',
              color: 'var(--ink)', border: '1px solid var(--line)', outline: 'none',
              borderRadius: 10, background: 'var(--card)', resize: 'none',
            }}
          />
        </div>

        <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={send}
            disabled={!item.trim()}>
            Crear pedido
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function Label({ children, top }) {
  return (
    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.04em', margin: top ? '16px 0 8px' : '0 0 8px' }}>
      {children.toUpperCase()}
    </div>
  );
}
