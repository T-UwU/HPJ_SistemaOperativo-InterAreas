// src/roles/reception/Rooms.jsx — Grid de habitaciones por piso.
// Migrado de screens-reception.jsx::ReceptionRooms.
// · Lee rooms del store y las agrupa por piso
// · Tap → /reception/guest/:roomId (TODO: cambiar a /reception/room/:id si prefieres)
// · Mapea status del seed a los estilos del mockup

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body,
} from '../../ui/shared.jsx';
import { useRooms } from '../../store/data.js';

// Mapeo de status del seed → status visual del tile
const statusToTone = {
  ocupada:  'busy',
  limpia:   'clean',
  sucia:    'warn',     // sucia = "limpiando" en la vista
  checkout: 'warn',
  bloqueada: 'danger',
  libre:    'empty',
};

export default function ReceptionRooms() {
  const navigate = useNavigate();
  const rooms = useRooms();
  const occupied = rooms.filter(r => r.status === 'ocupada').length;

  // Agrupar por piso (descendente — pisos altos arriba)
  const byFloor = rooms.reduce((acc, r) => {
    acc[r.floor] = acc[r.floor] || [];
    acc[r.floor].push(r);
    return acc;
  }, {});
  const floors = Object.keys(byFloor)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <PhoneScreen>
      <BrandStrip role="reception"/>
      <AppBar title="Habitaciones" subtitle={`${rooms.length} totales · ${occupied} ocupadas`}/>
      <div style={{ padding: '6px 16px 10px', display: 'flex', gap: 12, flexWrap: 'wrap',
        fontSize: 11, color: 'var(--muted)' }}>
        <span><span className="sq sq-busy"/> Ocupada</span>
        <span><span className="sq sq-clean"/> Limpia</span>
        <span><span className="sq sq-warn"/> En limpieza</span>
        <span><span className="sq sq-danger"/> Mantenimiento</span>
        <span><span className="sq sq-empty"/> Libre</span>
      </div>
      <Body style={{ paddingBottom: 80 }}>
        {floors.map((n) => (
          <div key={n}>
            <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="hpj-serif" style={{ fontSize: 18 }}>Piso {n}</span>
              <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>· {byFloor[n].length} habs</span>
            </div>
            <div style={{ padding: '4px 16px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {byFloor[n].map((r) => (
                <RoomTile
                  key={r.id}
                  n={r.id}
                  s={statusToTone[r.status] || 'empty'}
                  glow={!!r.vipPending}
                  onClick={() => navigate(`/reception/guest/${r.id}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </Body>
    </PhoneScreen>
  );
}

function RoomTile({ n, s, glow, onClick }) {
  const map = {
    busy:   { bg: 'var(--brass-soft)',  fg: 'var(--brass-deep)',  label: 'Ocupada' },
    clean:  { bg: 'var(--forest-soft)', fg: 'var(--forest-deep)', label: 'Limpia' },
    warn:   { bg: 'var(--warn-soft)',   fg: 'var(--warn)',        label: 'Limpiando' },
    danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)',      label: 'Mant.' },
    empty:  { bg: 'var(--card)',        fg: 'var(--muted)',       label: 'Libre' },
  }[s];
  return (
    <button onClick={onClick} style={{
      background: map.bg, color: map.fg,
      borderRadius: 10, padding: '10px 12px',
      border: glow ? '1.5px solid var(--brass)' : '1px solid transparent',
      boxShadow: glow ? '0 0 0 3px var(--brass-soft)' : undefined,
      position: 'relative', textAlign: 'left', cursor: 'pointer',
      fontFamily: 'inherit',
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10, marginTop: 4, letterSpacing: '0.05em' }}>{map.label}</div>
      {glow && <span style={{
        position: 'absolute', top: 6, right: 6,
        fontFamily: 'var(--serif)', fontSize: 9,
        letterSpacing: '0.18em', color: 'var(--brass-deep)',
      }}>VIP</span>}
    </button>
  );
}
