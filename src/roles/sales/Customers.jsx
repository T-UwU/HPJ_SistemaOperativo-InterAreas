// src/roles/sales/Customers.jsx — Lista de clientes VIP / Club Julio.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, Body, Eyebrow, Card, Avatar, Pill,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useCustomers } from '../../store/data.js';

export default function SalesCustomers() {
  const navigate  = useNavigate();
  const customers = useCustomers();
  const vipCount  = customers.filter((c) => c.vip).length;

  return (
    <PhoneScreen>
      <BrandStrip role="sales"/>
      <AppBar
        title="Clientes"
        subtitle={`${customers.length} en directorio · ${vipCount} VIP`}
        trailing={<><IconBtn icon={I.search}/><IconBtn icon={I.filter}/></>}
      />
      <Body style={{ paddingBottom: 80 }}>
        <Eyebrow>Club Julio</Eyebrow>
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>
              Sin clientes registrados.
            </div>
          )}
          {customers.map((c) => (
            <Card key={c.id} style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => navigate(`/sales/customer/${c.id}`)}>
              <Avatar name={c.name} size={44} tone="brass"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                  {c.vip && <span style={{ fontFamily: 'var(--serif)', fontSize: 10, color: 'var(--brass-deep)', letterSpacing: '0.2em' }}>VIP</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                  {c.stays ?? 0} estancias · MXN {Math.round((c.lifetimeRevenue ?? 0) / 1000)}k ingresos
                </div>
              </div>
              {c.tier && (
                <Pill kind={c.tier === 'oro' ? 'brass' : c.tier === 'plata' ? 'info' : ''}
                  style={{ height: 18, fontSize: 10 }}>{c.tier.toUpperCase()}</Pill>
              )}
              <span style={{ color: 'var(--muted)' }}>{I.chevR}</span>
            </Card>
          ))}
        </div>
      </Body>
    </PhoneScreen>
  );
}
