// src/roles/maintenance/Requisitions.jsx — Requisiciones de mantenimiento.

import React, { useState } from 'react';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Card, Pill, FAB,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useRequisitions, useActions } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';

const STATUS_KIND  = { pedido: 'warn', 'en-camino': 'info', surtido: 'ok', completado: '' };
const STATUS_LABEL = { pedido: 'PEDIDO', 'en-camino': 'EN CAMINO', surtido: 'SURTIDO', completado: 'RECIBIDO' };

const PRIORITY_COLOR = { urgente: 'var(--danger)', normal: 'var(--brass)', 'puede-esperar': 'var(--muted)' };
const PRIORITY_LABEL = { urgente: 'URGENTE', normal: 'NORMAL', 'puede-esperar': 'SIN PRISA' };

const CATEGORIES = [
  { id: 'insumo',      label: 'Insumo' },
  { id: 'material',    label: 'Material' },
  { id: 'herramienta', label: 'Herramienta' },
  { id: 'servicio',    label: 'Servicio' },
  { id: 'otro',        label: 'Otro' },
];

export default function MaintenanceRequisitions() {
  const user = useCurrentUser();
  const all  = useRequisitions();
  const { addRequisition, updateRequisitionStatus } = useActions();
  const reqs = all.filter((r) => r.area === 'maintenance');

  const [sheet, setSheet] = useState(false);

  const pedidos    = reqs.filter((r) => r.status === 'pedido');
  const enCamino   = reqs.filter((r) => r.status === 'en-camino');
  const surtidos   = reqs.filter((r) => r.status === 'surtido');
  const completados = reqs.filter((r) => r.status === 'completado');

  return (
    <PhoneScreen>
      <BrandStrip role="maintenance"/>
      <AppBar
        eyebrow="Estado de mis pedidos"
        title="Requisiciones"
        subtitle={`${pedidos.length} pendientes · ${enCamino.length} en camino`}
      />
      <Body style={{ paddingBottom: 80 }}>
        {reqs.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Sin requisiciones registradas.
          </div>
        )}

        {enCamino.length > 0 && (
          <>
            <Eyebrow>En camino</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {enCamino.map((r) => <ReqRow key={r.id} req={r}/>)}
            </div>
          </>
        )}

        {pedidos.length > 0 && (
          <>
            <Eyebrow>Pendientes</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pedidos.map((r) => <ReqRow key={r.id} req={r}/>)}
            </div>
          </>
        )}

        {surtidos.length > 0 && (
          <>
            <Eyebrow>Listos para recoger</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {surtidos.map((r) => (
                <ReqRow
                  key={r.id} req={r}
                  onConfirm={() => updateRequisitionStatus(r.id, 'completado')}
                />
              ))}
            </div>
          </>
        )}

        {completados.length > 0 && (
          <>
            <Eyebrow>Recibidos</Eyebrow>
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completados.map((r) => <ReqRow key={r.id} req={r}/>)}
            </div>
          </>
        )}
      </Body>

      <FAB icon={I.plus} label="Nueva requisición" onClick={() => setSheet(true)}/>

      {sheet && (
        <ReqSheet
          onClose={() => setSheet(false)}
          onSave={(data) => {
            addRequisition({ area: 'maintenance', requestedBy: user?.name || 'Mantenimiento', ...data });
            setSheet(false);
          }}
        />
      )}
    </PhoneScreen>
  );
}

function ReqRow({ req, onConfirm }) {
  const priorityColor = PRIORITY_COLOR[req.priority] || 'var(--muted)';
  const priorityLabel = PRIORITY_LABEL[req.priority];
  const catLabel = CATEGORIES.find((c) => c.id === req.category)?.label;
  const date = new Date(req.createdAt || req.updatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

  return (
    <Card style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 4, background: priorityColor, flexShrink: 0, borderRadius: '0 0 0 0' }}/>
        <div style={{ flex: 1, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{req.item}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>×{req.qty}</span>
                {catLabel && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--line)', color: 'var(--ink-3)', fontWeight: 500 }}>
                    {catLabel}
                  </span>
                )}
                {priorityLabel && req.priority !== 'normal' && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: priorityColor + '22', color: priorityColor, fontWeight: 600, letterSpacing: '0.03em' }}>
                    {priorityLabel}
                  </span>
                )}
                <span style={{ fontSize: 10, color: 'var(--muted-2)', marginLeft: 'auto' }}>{date}</span>
              </div>
              {req.notes && (
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 5, fontStyle: 'italic' }}>
                  "{req.notes}"
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              {onConfirm ? (
                <button
                  onClick={onConfirm}
                  style={{
                    fontSize: 11, padding: '5px 10px', borderRadius: 8,
                    background: 'var(--forest)', color: 'var(--bg)', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                  }}
                >
                  Recibido ✓
                </button>
              ) : (
                <Pill kind={STATUS_KIND[req.status]} style={{ height: 18, fontSize: 9 }}>
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

function ReqSheet({ onClose, onSave }) {
  const [item,     setItem]     = useState('');
  const [qty,      setQty]      = useState(1);
  const [notes,    setNotes]    = useState('');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('insumo');

  const canSave = item.trim() !== '' && qty > 0;

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', background: 'var(--bg)', borderRadius: '16px 16px 0 0', padding: '20px 16px 36px', maxHeight: '88%', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Nueva requisición</div>

        <SheetField label="Artículo o material">
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Ej. Foco LED 9W, WD-40, llave stilson…"
            autoFocus
            style={inputStyle}
          />
        </SheetField>

        <SheetField label="Cantidad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={stepBtn}>−</button>
            <span className="hpj-serif" style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={stepBtn}>+</button>
          </div>
        </SheetField>

        <SheetField label="Categoría">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
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
        </SheetField>

        <SheetField label="Prioridad">
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'urgente',       label: 'Urgente',    color: 'var(--danger)' },
              { id: 'normal',        label: 'Normal',     color: 'var(--brass)' },
              { id: 'puede-esperar', label: 'Sin prisa',  color: 'var(--muted)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12,
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
        </SheetField>

        <SheetField label="Notas (opcional)">
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Especificaciones, para qué área, marca preferida…"
            style={inputStyle}
          />
        </SheetField>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, opacity: canSave ? 1 : 0.4 }}
            disabled={!canSave}
            onClick={() => onSave({ item: item.trim(), qty, notes: notes.trim() || undefined, priority, category })}
          >
            Enviar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 6 }}>
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px', borderRadius: 10, width: '100%',
  border: '1.5px solid var(--line)', background: 'var(--card)',
  color: 'var(--ink)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
};

const stepBtn = {
  width: 32, height: 32, borderRadius: 8,
  border: '1.5px solid var(--line)', background: 'var(--card)',
  fontSize: 18, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  color: 'var(--ink)', fontFamily: 'inherit',
};
