// src/roles/sales/Calendar.jsx — Resumen de ocupación en tiempo real.

import React from 'react';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Card, Metric,
} from '../../ui/shared.jsx';
import { useRooms, useArrivals } from '../../store/data.js';

function monthLabel() {
  return new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

const STATUS_META = {
  ocupada:  { label: 'Ocupadas',   color: 'var(--forest-deep)' },
  limpia:   { label: 'Disponibles', color: 'var(--forest)' },
  sucia:    { label: 'En limpieza', color: 'var(--warn)' },
  checkout: { label: 'En salida',  color: 'var(--brass)' },
  bloqueada:{ label: 'Bloqueadas', color: 'var(--danger)' },
};

export default function SalesCalendar() {
  const rooms    = useRooms();
  const arrivals = useArrivals();
  const total    = rooms.length;

  const byStatus = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const ocupadas   = byStatus.ocupada   || 0;
  const disponibles = byStatus.limpia   || 0;
  const pctOcup    = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
  const pendientes = arrivals.filter((a) => !a.done).length;

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        eyebrow={monthLabel()}
        title="Ocupación"
      />
      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '4px 16px 0', display: 'flex', gap: 8 }}>
          <Metric label="Ocupación" value={`${pctOcup}%`} foot={`${ocupadas} de ${total} habs`}/>
          <Metric label="Disponibles" value={String(disponibles)} foot="limpias y libres"/>
        </div>

        <Eyebrow>Por estado</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <Card style={{ padding: 14 }}>
            {Object.entries(STATUS_META).map(([status, meta]) => {
              const count = byStatus[status] || 0;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} style={{ padding: '8px 0', borderBottom: status === 'bloqueada' ? 'none' : '1px solid var(--line-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 500 }}>{meta.label}</span>
                    <span className="hpj-mono" style={{ color: 'var(--muted)' }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: 'var(--card-2)', overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: meta.color, transition: 'width .3s' }}/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {pendientes > 0 && (
          <>
            <Eyebrow>Próximas llegadas</Eyebrow>
            <div style={{ padding: '0 16px 16px' }}>
              <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--brass-soft)', color: 'var(--brass-deep)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500,
                }}>
                  {pendientes}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {pendientes === 1 ? '1 llegada pendiente' : `${pendientes} llegadas pendientes`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    registradas en recepción
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}
