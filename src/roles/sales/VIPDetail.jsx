// src/roles/sales/VIPDetail.jsx — Detalle de cliente VIP.
// Migrado de screens-sales.jsx::SalesVIPDetail.
// · Lee customer del store por :id
// · Estancia activa se busca en reservations por customerId

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  PhoneScreen, Body, Eyebrow, Card, Pill, Avatar, KV, Metric, BackBtn,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useCustomers, useReservations } from '../../store/data.js';

const ICON_MAP = {
  coffee:  I.coffee,
  flame:   I.flame,
  bed:     I.bed,
  star:    I.star,
  sparkle: I.sparkle,
};

export default function SalesVIPDetail() {
  const { id } = useParams();
  const customers = useCustomers();
  const reservations = useReservations();

  const customer = customers.find((c) => c.id === id);
  if (!customer) return <Navigate to="/sales" replace />;

  const activeReservation = reservations.find((r) => r.customerId === customer.id);
  const tierLabel = customer.tier === 'oro' ? 'TIER ORO' : customer.tier === 'plata' ? 'TIER PLATA' : 'CLUB JULIO';

  return (
    <PhoneScreen>
      <div style={{ position: 'relative', height: 170, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #6B5739 0%, #2B463A 100%)',
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 16px)',
        }}/>
        <div style={{ position: 'relative', padding: '14px 18px', color: '#FAF4E6' }}>
          <BackBtn label="Clientes"/>
          <div style={{ marginTop: 26, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <Avatar name={customer.name} size={64} tone="brass"/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 11, letterSpacing: '0.22em', color: 'var(--brass-soft)' }}>
                VIP · CLUB JULIO · {tierLabel}
              </div>
              <div className="hpj-serif" style={{ fontSize: 26, color: '#FAF4E6', marginTop: 2, lineHeight: 1.1 }}>
                {customer.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                {customer.stays}ª estancia · Cliente desde {customer.since}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8 }}>
          <Metric
            label="Ingreso histórico"
            value={`$${Math.round(customer.lifetimeRevenue / 1000)}k`}
            sub="MXN" foot={`${customer.stays} estancias`}
          />
          <Metric
            label="NPS"
            value={String(customer.nps)}
            sub="/ 10" kind="up" foot="Última visita"
          />
        </div>

        {activeReservation && (
          <>
            <Eyebrow>Estancia activa</Eyebrow>
            <div style={{ padding: '0 16px' }}>
              <Card style={{ padding: 14 }}>
                <KV k="Hab"      v={`${activeReservation.room} · ${activeReservation.roomType}`} vbold/>
                <KV k="Estancia" v={`${activeReservation.stay}`}/>
                <KV k="Plan"     v={activeReservation.plan}/>
                {customer.insights?.find((i) => i.tone === 'brass') && (
                  <KV k="Cortesía sugerida"
                    v={customer.insights.find((i) => i.tone === 'brass').text}/>
                )}
                <KV
                  k="Estado"
                  v={
                    activeReservation.status === 'confirmada'
                      ? <Pill kind="ok">Confirmada</Pill>
                      : <Pill kind="warn">Por confirmar</Pill>
                  }
                  vbold
                />
              </Card>
            </div>
          </>
        )}

        {customer.insights && customer.insights.length > 0 && (
          <>
            <Eyebrow>Insights</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {customer.insights.map((ins, i) => (
                <InsightRow
                  key={i}
                  icon={ICON_MAP[ins.icon] || I.sparkle}
                  text={ins.text}
                  tone={ins.tone}
                />
              ))}
            </div>
          </>
        )}

        {customer.previousStays && customer.previousStays.length > 0 && (
          <>
            <Eyebrow>Estancias previas</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {customer.previousStays.map((stay, i) => (
                <PrevStay key={i} {...stay}/>
              ))}
            </div>
          </>
        )}
      </Body>
    </PhoneScreen>
  );
}

function InsightRow({ icon, text, tone }) {
  const map = {
    danger: ['var(--danger-soft)', 'var(--danger)'],
    brass:  ['var(--brass-soft)',  'var(--brass-deep)'],
  };
  const colors = map[tone];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
      borderRadius: 10, background: colors ? colors[0] : 'var(--card)',
      border: '1px solid ' + (colors ? 'transparent' : 'var(--line)'),
    }}>
      <span style={{ color: colors ? colors[1] : 'var(--ink-3)' }}>{icon}</span>
      <span style={{
        fontSize: 12,
        color: colors ? colors[1] : 'var(--ink-2)',
        fontWeight: tone ? 500 : 400,
      }}>{text}</span>
    </div>
  );
}

function PrevStay({ date, room, rating, plan }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      borderRadius: 10, background: 'var(--card-2)', border: '1px solid var(--line-soft)',
    }}>
      <span className="hpj-mono" style={{ fontSize: 11, color: 'var(--muted)', minWidth: 60 }}>{date}</span>
      <div style={{ flex: 1, fontSize: 12 }}>Hab {room} · {plan}</div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--brass-deep)' }}>
        <span style={{ fontSize: 10 }}>★</span>{rating}
      </span>
    </div>
  );
}
