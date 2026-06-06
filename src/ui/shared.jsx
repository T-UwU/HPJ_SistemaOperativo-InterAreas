// src/ui/shared.jsx — Componentes compartidos del sistema HPJ.
// Migrado del ui-shared.jsx original. Cambios principales:
//   · named exports (ES modules)
//   · TabBar acepta `to` por item y navega con React Router
//   · BackBtn nuevo: chevron que sí hace navigate(-1)
//   · Movidos aquí los sub-componentes que vivían en screens-reception:
//     TLItem, Bubble, DayStamp, SystemNote.
//   · Y PhotoTile que vivía en screens-housekeeping.

import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Icon, I } from './icons.jsx';
import { useCurrentUser } from '../store/auth.js';

// ── Layout primitives ─────────────────────────────────────────
export function Screen({ children, bg = 'var(--bg)' }) {
  return (
    <div className="hpj scroll" style={{
      height: '100%', background: bg,
      display: 'flex', flexDirection: 'column',
    }}>{children}</div>
  );
}

export function PhoneScreen({ children }) {
  return (
    <div className="hpj" style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>{children}</div>
  );
}

export function Body({ children, style }) {
  return (
    <div className="scroll" style={{ flex: 1, overflowY: 'auto', ...style }}>{children}</div>
  );
}

// ── App bar ───────────────────────────────────────────────────
export function AppBar({ title, subtitle, eyebrow, leading, trailing, serif = true, sticky = true }) {
  return (
    <div style={{
      position: sticky ? 'sticky' : 'static', top: 0, zIndex: 5,
      background: 'var(--bg)',
      padding: '14px 18px 12px',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {leading}
          <div>
            {eyebrow && <div className="section-eyebrow" style={{ marginBottom: 3 }}>{eyebrow}</div>}
            <div style={{
              fontSize: serif ? 26 : 22, fontWeight: 500,
              fontFamily: serif ? 'var(--serif)' : 'var(--sans)',
              letterSpacing: serif ? '-0.005em' : '-0.02em',
              lineHeight: 1.1,
            }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{trailing}</div>
      </div>
    </div>
  );
}

// ── Icon button ───────────────────────────────────────────────
export function IconBtn({ icon, badge, onClick, style }) {
  return (
    <button className="btn-icon" onClick={onClick} style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 38, height: 38, padding: 0, border: '1px solid var(--line)',
      background: 'var(--card)', borderRadius: 999, color: 'var(--ink-2)', cursor: 'pointer',
      ...style,
    }}>
      {icon}
      {badge && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          minWidth: 16, height: 16, padding: '0 4px',
          borderRadius: 999, background: 'var(--brass)', color: '#FAF4E6',
          fontSize: 10, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid var(--bg)',
        }}>{badge}</span>
      )}
    </button>
  );
}

// Back chevron — usa navigate(-1) por default, o `to` si se pasa.
export function BackBtn({ to, label = 'Atrás' }) {
  const navigate = useNavigate();
  const handler = () => (to ? navigate(to) : navigate(-1));
  return (
    <button onClick={handler} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'transparent', border: 'none', padding: 0,
      color: 'inherit', fontSize: 13, opacity: 0.85, cursor: 'pointer',
    }}>
      {I.chevL} {label}
    </button>
  );
}

// ── Pills / chips ─────────────────────────────────────────────
export function Pill({ children, kind = '', style }) {
  return <span className={`pill ${kind ? 'pill-' + kind : ''}`} style={style}>{children}</span>;
}

export function RoleChip({ role }) {
  const map = {
    reception: ['Recepción', 'role-reception'],
    housekeeping: ['Limpieza', 'role-housekeeping'],
    kitchen: ['Cocina', 'role-kitchen'],
    sales: ['Ventas', 'role-sales'],
    maintenance: ['Mantenim.', 'role-maintenance'],
    management: ['Gerencia', 'role-management'],
    concierge: ['Concierge', 'role-concierge'],
  };
  const [name, cls] = map[role] || ['—', ''];
  return (
    <span className="pill pill-ghost" style={{ height: 18, fontSize: 10, padding: '0 7px' }}>
      <span className={`role-dot ${cls}`}/>
      {name}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ name, size = 36, tone = 'brass' }) {
  const initials = (name || '?').split(' ').map(w => w[0] || '').filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  const tones = {
    brass: ['var(--brass-soft)', 'var(--brass-deep)'],
    forest: ['var(--forest-soft)', 'var(--forest-deep)'],
    plum: ['#E9DEEC', '#5A3F66'],
    blue: ['var(--info-soft)', 'var(--info)'],
  };
  const [bg, fg] = tones[tone] || tones.brass;
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--serif)', fontSize: size * 0.4, fontWeight: 600,
      flexShrink: 0,
    }}>{initials}</span>
  );
}

// ── Bottom tab bar — ahora enrutable ──────────────────────────
// items: [{ id, label, icon, to }]
// `active` (legacy) sigue funcionando; si no se pasa, los NavLink lo
// determinan por la URL.
export function TabBar({ items, active }) {
  return (
    <div className="tabbar">
      {items.map((it) => {
        if (it.to) {
          return (
            <NavLink key={it.id} to={it.to} end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
              <span style={{ height: 20, display: 'flex', alignItems: 'center', position: 'relative' }}>
                {it.icon}
                {!!it.badge && (
                  <span style={{
                    position: 'absolute', top: -4, right: -7,
                    minWidth: 14, height: 14, padding: '0 3px',
                    borderRadius: 999, background: 'var(--danger)', color: '#fff',
                    fontSize: 9, fontWeight: 700, lineHeight: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--bg)',
                  }}>{it.badge > 9 ? '9+' : it.badge}</span>
                )}
              </span>
              <span>{it.label}</span>
              <span className="ind"/>
            </NavLink>
          );
        }
        const isActive = it.id === active;
        return (
          <button key={it.id} className={`tab ${isActive ? 'active' : ''}`} onClick={it.onClick}>
            <span style={{ height: 20, display: 'flex', alignItems: 'center' }}>{it.icon}</span>
            <span>{it.label}</span>
            <span className="ind"/>
          </button>
        );
      })}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────
export function Eyebrow({ children, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px 6px',
    }}>
      <div className="section-eyebrow">{children}</div>
      {right && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{right}</div>}
    </div>
  );
}

// ── Card + metric ─────────────────────────────────────────────
export function Card({ children, style, onClick, accent }) {
  return (
    <div className="card" onClick={onClick} style={{
      borderLeft: accent ? `3px solid ${accent}` : undefined,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>{children}</div>
  );
}

export function Metric({ label, value, sub, kind, foot }) {
  return (
    <Card style={{ padding: '14px 14px 12px', flex: 1, minWidth: 0 }}>
      <div className="section-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div className="hpj-serif" style={{ fontSize: 30, lineHeight: 1, fontWeight: 500 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: kind === 'down' ? 'var(--danger)' : kind === 'up' ? 'var(--ok)' : 'var(--muted)', fontWeight: 500 }}>{sub}</div>}
      </div>
      {foot && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{foot}</div>}
    </Card>
  );
}

// ── Image placeholder ─────────────────────────────────────────
export function ImgPh({ label, h = 120, style }) {
  return (
    <div className="img-ph" style={{ height: h, borderRadius: 12, ...style }}>{label}</div>
  );
}

// ── Brand strip ───────────────────────────────────────────────
export function BrandStrip({ role }) {
  const user = useCurrentUser();
  const map = {
    reception: 'RECEPCIÓN', housekeeping: 'LIMPIEZA', kitchen: 'COCINA',
    sales: 'VENTAS', maintenance: 'MANTENIMIENTO', purchasing: 'COMPRAS',
    management: 'GERENCIA', concierge: 'CONCIERGE',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 18px 0',
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 11, letterSpacing: '0.22em',
        color: 'var(--brass-deep)', fontWeight: 500, textTransform: 'uppercase' }}>
        Palacio Julio
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)',
        letterSpacing: '0.08em' }}>
        {map[role] || ''}
      </div>
    </div>
  );
}

// ── FAB ───────────────────────────────────────────────────────
export function FAB({ icon, label, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 18, bottom: 18, zIndex: 6,
      height: 52, padding: label ? '0 18px 0 16px' : 0, width: label ? undefined : 52,
      borderRadius: 999, border: 'none', cursor: 'pointer',
      background: 'var(--forest)', color: 'var(--bg)',
      boxShadow: '0 8px 20px rgba(27,46,38,0.32), 0 0 0 1px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 14, fontWeight: 500,
      ...style,
    }}>{icon}{label}</button>
  );
}

// ── KV + status ───────────────────────────────────────────────
export function KV({ k, v, vbold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 13 }}>
      <span style={{ color: 'var(--muted)' }}>{k}</span>
      <span style={{ color: 'var(--ink)', fontWeight: vbold ? 600 : 400 }}>{v}</span>
    </div>
  );
}

export function Status({ kind = 'ok', label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted-2)' }}>
      <span className={`dot dot-${kind}`}/> {label}
    </span>
  );
}

// ── Broadcast (cross-area) ────────────────────────────────────
export function Broadcast({ from, action, room, time, status = 'sent' }) {
  const fromColor = {
    reception: 'var(--brass)', housekeeping: 'var(--info)',
    kitchen: 'var(--warn)', sales: '#7C5F8A',
    maintenance: 'var(--danger)', concierge: 'var(--forest)',
  }[from] || 'var(--ink-3)';
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10, background: 'var(--card-2)',
      border: '1px dashed var(--hairline)', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span className="role-dot" style={{ background: fromColor, width: 8, height: 8, borderRadius: 2 }}/>
      <div style={{ flex: 1, fontSize: 12 }}>
        <div style={{ color: 'var(--ink)' }}><b style={{ fontWeight: 600 }}>{from}</b> · {action}</div>
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>Hab {room} · {time}</div>
      </div>
      <span className="pill pill-ok" style={{ height: 18, fontSize: 10 }}>
        {status === 'sent' ? 'ENVIADO' : status === 'read' ? 'LEÍDO' : 'PENDIENTE'}
      </span>
    </div>
  );
}

// ── Sub-componentes movidos desde screens-reception / screens-housekeeping ──
export function TLItem({ time, role, done, active, text, detail }) {
  return (
    <div className={`tl-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="hpj-mono" style={{ fontSize: 11, color: 'var(--muted-2)', minWidth: 38 }}>{time}</span>
        {role && <RoleChip role={role}/>}
        {active && <span className="pill pill-brass" style={{ height: 18, fontSize: 10 }}>EN CURSO</span>}
      </div>
      <div style={{ fontSize: 13, marginTop: 4, color: 'var(--ink)' }}>{text}</div>
      {detail && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{detail}</div>}
    </div>
  );
}

// Burbuja de chat estilo WhatsApp (forest para "me", card para "them"),
// con marca de doble check al estar leído.
export function Bubble({ side, text, time, read }) {
  const isMe = side === 'me';
  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '78%', padding: '8px 12px 6px',
        background: isMe ? 'var(--forest)' : 'var(--card)',
        color: isMe ? 'var(--bg)' : 'var(--ink)',
        borderRadius: 14,
        borderBottomRightRadius: isMe ? 4 : 14,
        borderBottomLeftRadius: isMe ? 14 : 4,
        border: isMe ? 'none' : '1px solid var(--line)',
        fontSize: 13, lineHeight: 1.4,
      }}>
        {text}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 10, opacity: 0.6 }}>{time}</span>
          {isMe && <span style={{ fontSize: 11, color: read ? '#9EC6E0' : 'rgba(255,255,255,0.5)' }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
}

export function DayStamp({ text }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{
        padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.6)',
        fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>{text}</span>
    </div>
  );
}

export function SystemNote({ text }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{
        padding: '4px 10px', borderRadius: 6, background: 'rgba(160,129,74,0.12)',
        color: 'var(--brass-deep)', fontSize: 11, fontStyle: 'italic',
      }}>· {text} ·</span>
    </div>
  );
}

export function PhotoTile({ label, caption, tone = 'muted' }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="img-ph" style={{ height: 72, borderRadius: 10 }}>{label}</div>
      {caption && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>{caption}</div>}
    </div>
  );
}

// Re-export icons for convenience
export { Icon, I };
