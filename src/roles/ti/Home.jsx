// src/roles/ti/Home.jsx — Panel de administración de usuarios.

import React, { useEffect, useState } from 'react';
import { PhoneScreen, Body } from '../../ui/shared.jsx';
import { supabase } from '../../lib/supabase.js';
import { useAuth } from '../../store/auth.js';

// ── Meta de roles ─────────────────────────────────────────────
const ROLE_META = {
  reception:    { label: 'Recepción',     bg: 'var(--brass-soft)',  fg: 'var(--brass-deep)', dot: 'var(--brass)'    },
  housekeeping: { label: 'Limpieza',      bg: 'var(--info-soft)',   fg: 'var(--info)',        dot: 'var(--info)'     },
  sales:        { label: 'Ventas',        bg: '#E9DEEC',            fg: '#5A3F66',            dot: '#7C5F8A'         },
  maintenance:  { label: 'Mantenimiento', bg: 'var(--danger-soft)', fg: 'var(--danger)',      dot: 'var(--danger)'   },
  purchasing:   { label: 'Compras',       bg: '#EAE3D2',            fg: '#5C4A2B',            dot: '#8C7345'         },
  ti:           { label: 'TI',            bg: '#DDE2E0',            fg: 'var(--forest-deep)', dot: 'var(--forest-deep)' },
};

const ROLE_OPTIONS = Object.entries(ROLE_META).map(([id, m]) => ({ id, label: m.label }));

const SHIFTS = {
  mat:  { label: 'Matutino',   range: '06–14', icon: 'sunrise' },
  vesp: { label: 'Vespertino', range: '14–22', icon: 'sun' },
  noc:  { label: 'Nocturno',   range: '22–06', icon: 'moon' },
};

const BLANK_FORM = { name: '', email: '', password: '', role_id: 'reception', shift: 'mat' };

// Invoca manage-user pasando siempre el token de sesión actual de forma explícita
async function invokeManageUser(body) {
  const { data: { session } } = await supabase.auth.getSession();
  return supabase.functions.invoke('manage-user', {
    body,
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });
}

// ── Iconos ────────────────────────────────────────────────────
function ShiftIcon({ kind, size = 12, color = 'currentColor' }) {
  const paths = {
    sunrise: <g><path d="M12 14a4 4 0 0 1 8 0"/><path d="M4 18h24"/><path d="M16 4v4"/><path d="M7 9l2 2"/><path d="M25 9l-2 2"/></g>,
    sun:     <g><circle cx="16" cy="16" r="5"/><path d="M16 4v3M16 25v3M4 16h3M25 16h3M7 7l2 2M23 23l2 2M7 25l2-2M23 9l2-2"/></g>,
    moon:    <path d="M22 18a8 8 0 1 1-8-12 6 6 0 0 0 8 12z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color}
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>
  );
}

const Wordmark = ({ width = 58, color = 'var(--brass-soft)' }) => (
  <svg viewBox="0 0 339 196" width={width} height={width * 196 / 339} style={{ display: 'block' }}>
    <g fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="25,48 65,78 100,51 131,76 174,42 220,74 261,55 303,89"/>
      <polyline points="25,114 69,139 104,124 132,141 162,122 185,137 218,122 241,135 271,120 302,137"/>
    </g>
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4l6 6L9 21H3v-6L14 4z"/>
  </svg>
);
const PlusIcon = ({ color = 'currentColor' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(244,239,230,0.55)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
  </svg>
);

// ── Átomos ────────────────────────────────────────────────────
function UserAvatar({ name, roleId, size = 44 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const m = ROLE_META[roleId] || ROLE_META.ti;
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: m.bg, color: m.fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--serif)', fontSize: size * 0.36, fontWeight: 600,
      flexShrink: 0, border: '1px solid rgba(0,0,0,0.04)',
    }}>{initials}</span>
  );
}

function RolePill({ roleId }) {
  const m = ROLE_META[roleId];
  if (!m) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 10px 5px 9px', borderRadius: 999,
      background: m.bg, color: m.fg,
      fontSize: 11, fontWeight: 500,
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: m.dot }}/>
      {m.label}
    </span>
  );
}

function ShiftChip({ shift }) {
  const s = SHIFTS[shift] || null;
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px 3px 7px', borderRadius: 999,
      background: 'var(--card-2)', border: '1px solid var(--line)',
      fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
      color: 'var(--muted)', textTransform: 'uppercase',
    }}>
      <ShiftIcon kind={s.icon} size={11} color="var(--brass-deep)"/>
      <span>{s.range}</span>
    </span>
  );
}

// ── Campos estilo editorial (underline) ───────────────────────
function TIField({ label, value, onChange, placeholder, type = 'text', hint, trailing, autoFocus }) {
  const [foc, setFoc] = useState(false);
  return (
    <label style={{ display: 'block' }}>
      <div style={{
        fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em',
        color: 'var(--muted-2)', marginBottom: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{label}</span>
        {hint && <span style={{
          fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--brass-deep)',
          letterSpacing: '0.1em', textTransform: 'none',
        }}>{hint}</span>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingBottom: 9,
        borderBottom: `1px solid ${foc ? 'var(--brass)' : 'var(--hairline)'}`,
        transition: 'border-color .2s',
      }}>
        <input
          type={type} value={value ?? ''} placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={e => onChange?.(e.target.value)}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: type === 'password' ? 'var(--mono)' : 'var(--sans)',
            fontSize: 15, fontWeight: 400,
            letterSpacing: type === 'password' ? '0.28em' : 0,
            color: 'var(--ink)', padding: 0, minWidth: 0,
          }}
        />
        {trailing}
      </div>
    </label>
  );
}

function RoleSelector({ value, onChange }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em',
        color: 'var(--muted-2)', marginBottom: 10,
      }}>Rol</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Object.entries(ROLE_META).map(([id, m]) => {
          const active = id === value;
          return (
            <button key={id} type="button" onClick={() => onChange?.(id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 10px', borderRadius: 999,
              background: active ? m.bg : 'transparent',
              color: active ? m.fg : 'var(--muted)',
              border: `1px solid ${active ? 'transparent' : 'var(--line)'}`,
              fontSize: 11.5, fontWeight: active ? 500 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 2, background: active ? m.dot : 'var(--faint)' }}/>
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ShiftSelector({ value = 'mat', onChange }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.16em',
        color: 'var(--muted-2)', marginBottom: 10,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Turno</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-2)', textTransform: 'none' }}>opcional</span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6,
        border: '1px solid var(--line)', borderRadius: 12,
        padding: 4, background: 'var(--card-2)',
      }}>
        {Object.entries(SHIFTS).map(([id, s]) => {
          const active = id === value;
          return (
            <button key={id} type="button" onClick={() => onChange?.(id)} style={{
              padding: '10px 8px 9px', borderRadius: 9, cursor: 'pointer',
              background: active ? 'var(--card)' : 'transparent',
              boxShadow: active ? '0 1px 2px rgba(27,46,38,0.08)' : 'none',
              border: active ? '1px solid var(--hairline)' : '1px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }}>
              <ShiftIcon kind={s.icon} size={18} color={active ? 'var(--brass-deep)' : 'var(--muted-2)'}/>
              <div style={{ fontSize: 11.5, fontWeight: active ? 500 : 400, color: active ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: active ? 'var(--brass-deep)' : 'var(--faint)', letterSpacing: '0.08em' }}>{s.range}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Fila de usuario ───────────────────────────────────────────
function UserRow({ user, onEdit }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: user.suspended ? 0.55 : 1,
    }}>
      <div style={{ position: 'relative' }}>
        <UserAvatar name={user.name} roleId={user.role_id}/>
        {user.suspended && (
          <span style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 11, height: 11, borderRadius: 999,
            background: 'var(--danger)', border: '2px solid var(--card)',
          }}/>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink)' }}>{user.name}</span>
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)',
          marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{user.email}</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.shift && user.shift !== '—' && <ShiftChip shift={user.shift}/>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <RolePill roleId={user.role_id}/>
        <button onClick={() => onEdit(user)} style={{
          width: 28, height: 28, borderRadius: 999, border: '1px solid var(--line)',
          background: 'transparent', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PencilIcon/>
        </button>
      </div>
    </div>
  );
}

// ── Bottom sheet ──────────────────────────────────────────────
function Sheet({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(27,46,38,0.42)',
        backdropFilter: 'blur(2px)', zIndex: 4,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .25s',
      }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
        background: 'var(--card)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: '12px 22px 32px',
        boxShadow: '0 -16px 36px rgba(0,0,0,0.22)',
        maxHeight: '90%', overflowY: 'auto',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .32s cubic-bezier(0.32, 0.72, 0.2, 1)',
      }}>
        <div style={{
          width: 36, height: 4, background: 'var(--hairline)', borderRadius: 99,
          margin: '0 auto 16px',
        }}/>
        {children}
      </div>
    </>
  );
}

// ── Contenido del sheet: Nuevo usuario ────────────────────────
function NewUserBody({ onClose, onDone }) {
  const [form, setForm]   = useState({ ...BLANK_FORM });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const canSave = form.name?.trim() && form.email?.trim() && form.password?.length >= 6;

  const handleCreate = async () => {
    setError('');
    setBusy(true);
    const { error: err } = await supabase.functions.invoke('create-user', {
      body: {
        email:    form.email.trim(),
        password: form.password,
        name:     form.name.trim(),
        role_id:  form.role_id,
        shift:    form.shift || '—',
      },
    });
    if (err) { setError(err.message); setBusy(false); return; }
    setBusy(false);
    onDone();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--brass-deep)', marginBottom: 6 }}>
            Crear acceso
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', margin: 0, fontSize: 24, fontWeight: 500, lineHeight: 1.1, color: 'var(--ink)' }}>
            Nuevo usuario
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Recibirá un correo para fijar su contraseña.
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: 999, border: '1px solid var(--line)',
          background: 'var(--card)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}><CloseIcon/></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <TIField label="Nombre completo" value={form.name} onChange={v => set('name', v)}
          placeholder="Nombre · Apellido" autoFocus/>
        <TIField label="Correo electrónico" type="email" value={form.email} onChange={v => set('email', v)}
          placeholder="nombre@palaciojulio.test" hint="@palaciojulio.test"/>
        <TIField label="Contraseña" type="password" value={form.password} onChange={v => set('password', v)}
          placeholder="Mínimo 6 caracteres" hint="temporal"/>
        <RoleSelector value={form.role_id} onChange={v => set('role_id', v)}/>
        <ShiftSelector value={form.shift} onChange={v => set('shift', v)}/>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: '9px 12px', borderRadius: 10, background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} style={{
          flex: 1, height: 48, borderRadius: 12, border: '1px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>Cancelar</button>
        <button onClick={handleCreate} disabled={busy || !canSave} style={{
          flex: 2, height: 48, borderRadius: 12, border: 'none',
          background: busy || !canSave ? 'var(--card-2)' : 'var(--forest)',
          color: busy || !canSave ? 'var(--muted)' : '#F4EFE6',
          fontSize: 13, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: busy || !canSave ? 'default' : 'pointer', fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: busy || !canSave ? 'none' : '0 6px 14px rgba(27,46,38,0.18)',
          transition: 'background .2s, color .2s',
        }}>
          {busy ? 'Creando…' : <>Crear usuario <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></>}
        </button>
      </div>
    </>
  );
}

// ── Contenido del sheet: Editar usuario ───────────────────────
function EditUserBody({ user, onClose, onDone }) {
  const [form,      setForm]      = useState({ name: user.name, role_id: user.role_id, shift: user.shift === '—' ? 'mat' : (user.shift || 'mat') });
  const [newPass,   setNewPass]   = useState('');
  const [suspended, setSuspended] = useState(!!user.suspended);
  const [busy,      setBusy]      = useState(false);
  const [busyPass,  setBusyPass]  = useState(false);
  const [busySusp,  setBusySusp]  = useState(false);
  const [error,     setError]     = useState('');
  const [passOk,    setPassOk]    = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setError('');
    setBusy(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({ name: form.name, role_id: form.role_id, shift: form.shift || '—' })
      .eq('id', user.id);
    if (err) { setError(err.message); setBusy(false); return; }
    setBusy(false);
    onDone();
  };

  const handleResetPassword = async () => {
    if (newPass.length < 6) return;
    setError('');
    setBusyPass(true);
    const { error: err } = await invokeManageUser({ action: 'reset-password', user_id: user.id, password: newPass });
    setBusyPass(false);
    if (err) { setError(err.message); return; }
    setNewPass('');
    setPassOk(true);
    setTimeout(() => setPassOk(false), 3000);
  };

  const handleToggleSuspend = async () => {
    setError('');
    setBusySusp(true);
    const action = suspended ? 'unsuspend' : 'suspend';
    const { error: err } = await invokeManageUser({ action, user_id: user.id });
    setBusySusp(false);
    if (err) { setError(err.message); return; }
    setSuspended(!suspended);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ position: 'relative' }}>
          <UserAvatar name={user.name} roleId={user.role_id} size={52}/>
          {suspended && (
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 14, height: 14, borderRadius: 999,
              background: 'var(--danger)', border: '2px solid var(--card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, color: '#fff',
            }}>✕</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--brass-deep)', marginBottom: 4 }}>
            Editar perfil
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', margin: 0, fontSize: 22, fontWeight: 500, lineHeight: 1.1, color: 'var(--ink)' }}>
            {user.name}
          </h2>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{user.email}</div>
        </div>
        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: 999, border: '1px solid var(--line)',
          background: 'var(--card)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}><CloseIcon/></button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <TIField label="Nombre completo" value={form.name} onChange={v => set('name', v)}/>
        <RoleSelector value={form.role_id} onChange={v => set('role_id', v)}/>
        <ShiftSelector value={form.shift} onChange={v => set('shift', v)}/>

        {/* Cambiar contraseña */}
        <div style={{
          padding: '14px 14px', borderRadius: 12,
          background: 'var(--card-2)', border: '1px solid var(--line)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted-2)', marginBottom: 10 }}>
            Cambiar contraseña
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, borderBottom: `1px solid ${newPass.length >= 6 ? 'var(--brass)' : 'var(--hairline)'}`, paddingBottom: 6, transition: 'border-color .2s' }}>
              <input
                type="password" value={newPass}
                onChange={e => { setNewPass(e.target.value); setPassOk(false); }}
                placeholder="Nueva contraseña…"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--mono)', fontSize: 14, letterSpacing: '0.2em',
                  color: 'var(--ink)', padding: 0, width: '100%',
                }}
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={busyPass || newPass.length < 6}
              style={{
                padding: '7px 12px', borderRadius: 8,
                background: passOk ? 'var(--ok-soft)' : newPass.length >= 6 ? 'var(--forest)' : 'var(--card)',
                color: passOk ? 'var(--ok)' : newPass.length >= 6 ? '#F4EFE6' : 'var(--faint)',
                border: 'none', fontSize: 11, fontWeight: 500,
                cursor: newPass.length >= 6 ? 'pointer' : 'default',
                fontFamily: 'inherit', transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {busyPass ? '…' : passOk ? '✓ Guardada' : 'Cambiar'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--faint)', marginTop: 6 }}>Mínimo 6 caracteres</div>
        </div>

        {/* Suspender / Reactivar */}
        <div style={{
          padding: 12, borderRadius: 12,
          background: suspended ? 'var(--ok-soft)' : 'var(--danger-soft)',
          border: `1px solid ${suspended ? 'rgba(79,122,78,0.25)' : 'rgba(161,66,55,0.18)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          transition: 'background .25s, border .25s',
        }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: suspended ? 'var(--ok)' : 'var(--danger)' }}>
              {suspended ? 'Acceso suspendido' : 'Suspender acceso'}
            </div>
            <div style={{ fontSize: 11, color: suspended ? 'var(--ok)' : 'var(--danger)', opacity: 0.75, marginTop: 2 }}>
              {suspended ? 'El usuario no puede iniciar sesión.' : 'El usuario no podrá iniciar sesión.'}
            </div>
          </div>
          <button
            onClick={handleToggleSuspend}
            disabled={busySusp}
            style={{
              padding: '7px 12px', borderRadius: 999,
              border: `1px solid ${suspended ? 'var(--ok)' : 'var(--danger)'}`,
              background: 'transparent',
              color: suspended ? 'var(--ok)' : 'var(--danger)',
              fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              opacity: busySusp ? 0.5 : 1,
            }}
          >
            {busySusp ? '…' : suspended ? 'Reactivar' : 'Suspender'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: '9px 12px', borderRadius: 10, background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} style={{
          flex: 1, height: 48, borderRadius: 12, border: '1px solid var(--line)',
          background: 'var(--card)', color: 'var(--ink)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        }}>Cancelar</button>
        <button onClick={handleSave} disabled={busy || !form.name?.trim()} style={{
          flex: 2, height: 48, borderRadius: 12, border: 'none',
          background: busy || !form.name?.trim() ? 'var(--card-2)' : 'var(--forest)',
          color: busy || !form.name?.trim() ? 'var(--muted)' : '#F4EFE6',
          fontSize: 13, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
          boxShadow: busy || !form.name?.trim() ? 'none' : '0 6px 14px rgba(27,46,38,0.18)',
          transition: 'background .2s, color .2s',
        }}>
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </>
  );
}

// ── Pantalla principal ────────────────────────────────────────
export default function TIHome() {
  const logout = useAuth((s) => s.logout);
  const [profiles, setProfiles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sheet,    setSheet]    = useState(null); // null | { kind: 'new' } | { kind: 'edit', user }
  const [query,    setQuery]    = useState('');
  const [filter,   setFilter]   = useState('all');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, email, name, role_id, shift, suspended')
      .order('role_id');
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = profiles.filter(u => {
    const q = query.trim().toLowerCase();
    if (q && !(u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || ROLE_META[u.role_id]?.label.toLowerCase().includes(q))) return false;
    if (filter === 'ops')   return ['housekeeping','reception','maintenance'].includes(u.role_id);
    if (filter === 'admin') return ['ti','sales','purchasing'].includes(u.role_id);
    return true;
  });

  const open = sheet !== null;

  const FILTERS = [
    { id: 'all',   label: `Todos · ${profiles.length}` },
    { id: 'ops',   label: `Operación · ${profiles.filter(u => ['housekeeping','reception','maintenance'].includes(u.role_id)).length}` },
    { id: 'admin', label: `Admin · ${profiles.filter(u => ['ti','sales','purchasing'].includes(u.role_id)).length}` },
  ];

  return (
    <PhoneScreen>
      {/* Header oscuro */}
      <div style={{
        background: 'var(--forest-deep)', color: '#F4EFE6',
        padding: '18px 20px 20px', flexShrink: 0,
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Wordmark/>
            <div style={{ width: 1, height: 14, background: 'rgba(244,239,230,0.18)' }}/>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--brass-soft)', textTransform: 'uppercase' }}>
              TI · Administración
            </div>
          </div>
          <button onClick={logout} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 999,
            background: 'transparent', border: '1px solid rgba(244,239,230,0.22)',
            color: 'rgba(244,239,230,0.78)', fontSize: 11, letterSpacing: '0.08em',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <LogoutIcon/>Salir
          </button>
        </div>

        {/* Título + botón nuevo */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500, lineHeight: 1, color: '#F4EFE6' }}>
              Usuarios
            </div>
            <div style={{ fontSize: 12, color: 'rgba(244,239,230,0.55)', marginTop: 6, fontFamily: 'var(--mono)', letterSpacing: '0.06em' }}>
              {profiles.length} perfil{profiles.length !== 1 ? 'es' : ''} activos
            </div>
          </div>
          <button onClick={() => setSheet({ kind: 'new' })} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 16px 10px 13px', borderRadius: 999,
            background: 'var(--brass)', color: 'var(--forest-deep)',
            border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 10px rgba(0,0,0,0.22)',
            fontFamily: 'inherit',
          }}>
            <PlusIcon color="var(--forest-deep)"/>Nuevo
          </button>
        </div>

        {/* Búsqueda */}
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(244,239,230,0.06)', border: '1px solid rgba(244,239,230,0.12)',
        }}>
          <SearchIcon/>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o rol…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              color: '#F4EFE6', fontSize: 13, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', opacity: 0.6,
            }}>
              <CloseIcon/>
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '10px 16px 6px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {FILTERS.map(f => {
          const active = f.id === filter;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              whiteSpace: 'nowrap',
              padding: '6px 11px', borderRadius: 999,
              background: active ? 'var(--forest)' : 'transparent',
              color: active ? '#F4EFE6' : 'var(--muted)',
              border: `1px solid ${active ? 'var(--forest)' : 'var(--line)'}`,
              fontSize: 11.5, fontWeight: active ? 500 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{f.label}</button>
          );
        })}
      </div>

      {/* Lista */}
      <Body style={{ paddingBottom: 24 }}>
        <div style={{
          padding: '4px 16px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted-2)', fontWeight: 500 }}>
            Perfiles activos
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-2)', letterSpacing: '0.08em' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{
          padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8,
          opacity: open ? 0.4 : 1,
          filter: open ? 'saturate(0.7)' : 'none',
          pointerEvents: open ? 'none' : 'auto',
          transition: 'opacity .25s, filter .25s',
        }}>
          {loading ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Cargando…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '28px 16px', borderRadius: 12,
              border: '1px dashed var(--hairline)',
              textAlign: 'center', color: 'var(--muted)', fontSize: 13,
            }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)', marginBottom: 4 }}>Sin resultados</div>
              Prueba con otro término o cambia el filtro.
            </div>
          ) : (
            filtered.map(u => (
              <UserRow key={u.id} user={u} onEdit={user => setSheet({ kind: 'edit', user })}/>
            ))
          )}

          {!loading && (
            <button onClick={() => setSheet({ kind: 'new' })} style={{
              marginTop: 4, padding: 14, borderRadius: 12,
              border: '1px dashed var(--hairline)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'transparent', width: '100%', textAlign: 'left',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>¿Falta alguien del equipo?</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Crea un acceso nuevo.</div>
              </div>
              <PlusIcon color="var(--brass-deep)"/>
            </button>
          )}
        </div>
      </Body>

      <Sheet open={open} onClose={() => setSheet(null)}>
        {sheet?.kind === 'new'  && <NewUserBody  onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }}/>}
        {sheet?.kind === 'edit' && <EditUserBody user={sheet.user} onClose={() => setSheet(null)} onDone={() => { setSheet(null); load(); }}/>}
      </Sheet>
    </PhoneScreen>
  );
}
