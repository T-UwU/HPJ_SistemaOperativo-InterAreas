// src/roles/purchasing/Requisitions.jsx — Lista de requisiciones por estado.
// Compras gestiona pedidos de todas las áreas.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, IconBtn, Body, Eyebrow, Card, Pill, FAB,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useRequisitions, useActions } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';
import { useActivityUnread } from '../../store/activity.js';

const STATUS_KIND  = { pedido: 'warn', 'en-camino': 'info', surtido: 'ok', completado: '' };
const STATUS_LABEL = { pedido: 'PEDIDO', 'en-camino': 'EN CAMINO', surtido: 'SURTIDO', completado: 'RECIBIDO' };

const AREA_LABEL = {
  maintenance:  'Mantenimiento',
  housekeeping: 'Limpieza',
  reception:    'Recepción',
  sales:        'Ventas',
  purchasing:   'Compras',
};

const PRIORITY_COLOR = { urgente: 'var(--danger)', normal: 'var(--brass)', 'puede-esperar': 'var(--muted)' };
const PRIORITY_LABEL = { urgente: 'URGENTE', normal: 'NORMAL', 'puede-esperar': 'SIN PRISA' };

const CATEGORIES = {
  insumo: 'Insumo', material: 'Material', herramienta: 'Herramienta',
  servicio: 'Servicio', otro: 'Otro',
};

const AREA_FILTERS = [
  { id: 'todas',        label: 'Todas' },
  { id: 'maintenance',  label: 'Mant.' },
  { id: 'housekeeping', label: 'Limpieza' },
  { id: 'reception',    label: 'Recepción' },
  { id: 'sales',        label: 'Ventas' },
];

export default function PurchasingRequisitions() {
  const navigate = useNavigate();
  const reqs      = useRequisitions();
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);
  const { updateRequisitionStatus } = useActions();

  const [areaFilter, setAreaFilter] = useState('todas');

  const filtered = areaFilter === 'todas' ? reqs : reqs.filter((r) => r.area === areaFilter);

  const pedidos  = filtered.filter((r) => r.status === 'pedido');
  const enCamino = filtered.filter((r) => r.status === 'en-camino');
  const surtidos = filtered.filter((r) => r.status === 'surtido');

  const urgentCount = filtered.filter((r) => r.priority === 'urgente' && r.status !== 'surtido' && r.status !== 'completado').length;

  return (
    <PhoneScreen>
      <BrandStrip role="purchasing"/>
      <AppBar
        eyebrow={user?.name ? (user.shift && user.shift !== '—' ? `${user.name} · ${user.shift}` : user.name) : 'Compras'}
        title="Requisiciones"
        subtitle={`${pedidos.length + enCamino.length} activas${urgentCount > 0 ? ` · ${urgentCount} urgentes` : ''} · ${surtidos.length} surtidas`}
        trailing={
          <IconBtn icon={I.bell} badge={actUnread || undefined} onClick={() => navigate('/purchasing/notifications')}/>
        }
      />

      <div style={{ padding: '4px 16px 6px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {AREA_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setAreaFilter(f.id)}
            className={`pill ${areaFilter === f.id ? 'pill-forest' : ''}`}
            style={{ whiteSpace: 'nowrap', border: 'none', cursor: 'pointer' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Body style={{ paddingBottom: 80 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Sin requisiciones activas.
          </div>
        )}

        {pedidos.length > 0 && (
          <>
            <Eyebrow right={`${pedidos.length}`}>Por atender</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pedidos.map((r) => (
                <ReqCard
                  key={r.id}
                  req={r}
                  onAdvance={() => updateRequisitionStatus(r.id, 'en-camino')}
                />
              ))}
            </div>
          </>
        )}

        {enCamino.length > 0 && (
          <>
            <Eyebrow>En camino</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {enCamino.map((r) => (
                <ReqCard
                  key={r.id}
                  req={r}
                  onAdvance={() => updateRequisitionStatus(r.id, 'surtido')}
                />
              ))}
            </div>
          </>
        )}

        {surtidos.length > 0 && (
          <>
            <Eyebrow>Surtidos</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {surtidos.map((r) => (
                <ReqCard key={r.id} req={r}/>
              ))}
            </div>
          </>
        )}
      </Body>
      <FAB icon={I.plus} label="Nueva" onClick={() => navigate('/purchasing/new')}/>
    </PhoneScreen>
  );
}

function ReqCard({ req, onAdvance }) {
  const isSurtido = req.status === 'surtido';
  const priorityColor = PRIORITY_COLOR[req.priority] || 'var(--line)';
  const catLabel = CATEGORIES[req.category];
  const date = new Date(req.createdAt || req.updatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, background: priorityColor, flexShrink: 0 }}/>
        <div style={{ flex: 1, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{req.item}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>×{req.qty}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>·</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{AREA_LABEL[req.area] || req.area}</span>
                {catLabel && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--line)', color: 'var(--ink-3)', fontWeight: 500 }}>
                    {catLabel}
                  </span>
                )}
                {req.priority === 'urgente' && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--danger-bg, #fff0f0)', color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.03em' }}>
                    URGENTE
                  </span>
                )}
              </div>
              {req.notes && (
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 5, fontStyle: 'italic' }}>
                  "{req.notes}"
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 4 }}>{date}</div>
            </div>
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              {!isSurtido && onAdvance ? (
                <button
                  onClick={onAdvance}
                  style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 8,
                    background: 'var(--forest)', color: 'var(--bg)', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                  }}
                >
                  {req.status === 'pedido' ? 'En camino →' : 'Surtir →'}
                </button>
              ) : (
                <Pill kind={STATUS_KIND[req.status]} style={{ height: 20, fontSize: 10 }}>
                  {STATUS_LABEL[req.status]}
                </Pill>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
