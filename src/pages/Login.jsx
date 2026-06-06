// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../store/auth.js';
import { isOnlineMode } from '../lib/supabase.js';
import { I } from '../ui/icons.jsx';

const roleMeta = {
  sales:        { icon: I.trend,    desc: 'Reservas, calendario y clientes.' },
  reception:    { icon: I.bellDesk, desc: 'Llegadas, check-in y habitaciones.' },
  maintenance:  { icon: I.wrench,   desc: 'Tickets abiertos e historial.' },
  housekeeping: { icon: I.broom,    desc: 'Tareas de limpieza y turno.' },
};

// ── Crest: símbolo + wordmark (igual que la referencia) ──────────
function Crest({ width = 220 }) {
  const h = Math.round(width * (268 / 339));
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 339 268"
         width={width} height={h} style={{ display: 'block' }}>
      <g fill="none" stroke="var(--brass)" strokeWidth="20"
         strokeLinecap="round" strokeLinejoin="round">
        <polyline points="25,48 65,78 100,51 131,76 174,42 220,74 261,55 303,89"/>
        <polyline points="25,114 69,139 104,124 132,141 162,122 185,137 218,122 241,135 271,120 302,137"/>
      </g>
      <text x="164" y="223" textAnchor="middle" textLength="298" lengthAdjust="spacing"
        fontFamily="'Josefin Sans', sans-serif" fontWeight="300" fontSize="22"
        fill="var(--brass)" letterSpacing="1">PALACIOJULIOHOTEL</text>
      <text x="164" y="252" textAnchor="middle" textLength="298" lengthAdjust="spacing"
        fontFamily="'Barlow Condensed', sans-serif" fontWeight="400" fontSize="14"
        fill="var(--brass)" letterSpacing="1">CENTRO HISTÓRICO PUEBLA MÉXICO</text>
    </svg>
  );
}

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="var(--muted-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5C8.24261 5 5.43602 7.4404 3.76737 9.43934C2.51521 10.9394 2.51521 13.0606 3.76737 14.5607C5.43602 16.5596 8.24261 19 12 19C15.7574 19 18.564 16.5596 20.2326 14.5607C21.4848 13.0606 21.4848 10.9394 20.2326 9.43934C18.564 7.4404 15.7574 5 12 5Z"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/>
  </svg>
);

function greeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function DateRibbon() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const days   = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  const day = days[now.getDay()];
  const d   = String(now.getDate()).padStart(2,'0');
  const mon = months[now.getMonth()];
  const yr  = now.getFullYear();
  const hh  = String(now.getHours()).padStart(2,'0');
  const mm  = String(now.getMinutes()).padStart(2,'0');

  const monoStyle = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-2)', textTransform: 'uppercase' };

  return (
    <>
      <span style={monoStyle}>{day} · {d} {mon} · {yr}</span>
      <span style={monoStyle}>{hh}:{mm}</span>
    </>
  );
}

export default function Login() {
  const [showDemo, setShowDemo] = useState(!isOnlineMode);
  return showDemo ? <DemoSelector/> : <EmailLogin/>;
}

// ─────────────────────────────────────────────────────────────────
function EmailLogin() {
  const navigate = useNavigate();
  const loginWithEmail = useAuth((s) => s.loginWithEmail);
  const loading  = useAuth((s) => s.loading);
  const error    = useAuth((s) => s.error);

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [remember,   setRemember]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password);
      const user = useAuth.getState().user;
      if (user) navigate(ROLES[user.roleId].home, { replace: true });
    } catch {}
    finally { setSubmitting(false); }
  };

  const canSubmit = !submitting && !loading && email && password;

  return (
    <div className="hpj" style={{
      width: '100%', height: '100%', overflowY: 'auto',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 28px 22px',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8, flexShrink: 0,
      }}>
        <DateRibbon/>
      </div>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 12, paddingBottom: 0,
      }}>
        <Crest width={200}/>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{
            fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em',
            color: 'var(--brass-deep)', marginBottom: 0,
          }}>
            Acceso del personal
          </div>
          <h1 className="hpj-serif" style={{
            fontSize: 38, margin: '6px 0 0', fontWeight: 500,
            letterSpacing: '-0.015em', lineHeight: 1.05, color: 'var(--ink)',
          }}>
            {greeting()}
          </h1>
        </div>
      </div>

      {/* Formulario */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16, marginTop: 4, padding: '0 8px' }}>
        <Field label="Correo" type="email" value={email} onChange={setEmail}
          placeholder="ventas@palaciojulio.test" autoFocus autoComplete="email"/>
        <Field label="Contraseña" type={showPass ? 'text' : 'password'}
          value={password} onChange={setPassword} placeholder="••••••••"
          autoComplete="current-password"
          trailing={
            <button type="button" onClick={() => setShowPass(v => !v)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, display: 'flex', flexShrink: 0,
            }}>
              <EyeIcon/>
            </button>
          }
        />

        {error && (
          <div style={{
            padding: '9px 12px', borderRadius: 10,
            background: 'var(--danger-soft)', border: '1px solid var(--danger)',
            color: 'var(--danger)', fontSize: 12,
          }}>{error}</div>
        )}

        {/* Mantener sesión */}
        <div style={{ marginTop: -6 }}>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer',
          }}>
            <span onClick={() => setRemember(v => !v)} style={{
              width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `1px solid ${remember ? 'var(--forest)' : 'var(--hairline)'}`,
              background: remember ? 'var(--forest)' : 'var(--card)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}>
              {remember && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                     stroke="#F4EFE6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12l5 5L20 6"/>
                </svg>
              )}
            </span>
            Mantener sesión
          </label>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={submit}
        disabled={!canSubmit}
        style={{
          flexShrink: 0, width: '100%', height: 54, borderRadius: 14, border: 'none',
          background: canSubmit ? 'var(--forest)' : 'var(--card-2)',
          color: canSubmit ? '#F4EFE6' : 'var(--muted)',
          fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase', cursor: canSubmit ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          boxShadow: canSubmit ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 6px 14px rgba(27,46,38,0.18)' : 'none',
          transition: 'background .2s, color .2s, box-shadow .2s',
        }}
      >
        {submitting ? 'Iniciando…' : (
          <>
            <span>Entrar</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke={canSubmit ? '#F4EFE6' : 'var(--muted)'} strokeWidth="1.6"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>

    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, autoFocus, autoComplete, trailing }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'block' }}>
      <div style={{
        fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em',
        color: 'var(--muted-2)', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingBottom: 9,
        borderBottom: `1px solid ${focused ? 'var(--brass)' : 'var(--hairline)'}`,
        transition: 'border-color .2s',
      }}>
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus} autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: type === 'password' ? 'var(--mono)' : 'var(--sans)',
            fontSize: type === 'password' ? 15 : 14, fontWeight: 400,
            letterSpacing: type === 'password' ? '0.28em' : '-0.005em',
            color: 'var(--ink)', padding: 0, minWidth: 0,
          }}
        />
        {trailing}
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────
function DemoSelector() {
  const navigate  = useNavigate();
  const loginDemo = useAuth((s) => s.loginDemo);

  const enter = (roleId) => {
    loginDemo(roleId);
    navigate(ROLES[roleId].home, { replace: true });
  };

  return (
    <div className="hpj" style={{
      width: '100%', height: '100%', overflowY: 'auto',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 28px 22px',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8, flexShrink: 0,
      }}>
        <DateRibbon/>
      </div>

      {/* Hero */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 12, paddingBottom: 4,
      }}>
        <Crest width={210}/>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <div className="section-eyebrow" style={{ color: 'var(--brass-deep)', marginBottom: 8 }}>
            Acceso del personal
          </div>
          <h1 className="hpj-serif" style={{
            fontSize: 34, margin: 0, fontWeight: 500,
            letterSpacing: '-0.015em', lineHeight: 1.05, color: 'var(--ink)',
          }}>
            {greeting()}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0' }}>
            Selecciona tu área de trabajo.
          </p>
        </div>
      </div>

      {/* Roles */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        {Object.values(ROLES).map((role) => {
          const meta = roleMeta[role.id];
          if (!meta) return null;
          return (
            <button
              key={role.id}
              onClick={() => enter(role.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '12px 14px', borderRadius: 14,
                background: 'var(--card)', border: '1px solid var(--line)',
                borderLeft: `3px solid ${role.color}`,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', color: 'inherit',
                transition: 'transform .08s, background .12s',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; e.currentTarget.style.background = 'var(--card-2)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--card)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--card)'; }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `color-mix(in srgb, ${role.color} 10%, var(--card-2))`,
                color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{meta.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2 }}>
                  {role.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {meta.desc}
                </div>
              </div>
              <span style={{ color: 'var(--muted-2)', flexShrink: 0 }}>{I.chevR}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16, flexShrink: 0, textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em',
        color: 'var(--muted-2)', textTransform: 'uppercase',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
      }}>
        <span>Soporte · ext. 102</span>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--hairline)' }}/>
        <span>v0.3</span>
      </div>
    </div>
  );
}
