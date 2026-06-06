// src/ui/RoleMe.jsx — Pantalla "Yo" / perfil + logout.
// Genérica: lee el rol del usuario actual y se adapta. Cada rol la importa
// y la usa como elemento de su ruta `/me`.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Eyebrow, Card, Avatar, KV, Pill,
} from './shared.jsx';
import HpjLogo from './HpjLogo.jsx';
import { I } from './icons.jsx';
import { useAuth, useCurrentUser, ROLES } from '../store/auth.js';

export default function RoleMe() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const logout = useAuth((s) => s.logout);

  if (!user) return null;
  const role = ROLES[user.roleId];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <PhoneScreen>
      <BrandStrip role={user.roleId}/>
      <AppBar title="Mi sesión" subtitle="Información del turno actual"/>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 80 }}>
        <div style={{ padding: '6px 16px 0' }}>
          <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={user.name} size={56} tone="brass"/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hpj-serif" style={{ fontSize: 22, lineHeight: 1.1 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{role.label}</div>
              <div style={{ marginTop: 6 }}>
                {user.shift && user.shift !== '—' && (
                  <Pill kind="forest" style={{ height: 18, fontSize: 10 }}>
                    TURNO {user.shift.toUpperCase()}
                  </Pill>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Eyebrow>Sesión</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <Card style={{ padding: 14 }}>
            <KV k="Rol"     v={role.label}/>
            <KV k="Turno"   v={user.shift}/>
            <KV k="Versión" v="0.1.0 · demo"/>
          </Card>
        </div>

        <div style={{ padding: 16 }}>
          <button onClick={handleLogout} className="btn btn-ghost" style={{
            width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-soft)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {I.logout} Cerrar sesión
          </button>
        </div>

        <div style={{ padding: '40px 16px 36px', display: 'flex', justifyContent: 'center' }}>
          <HpjLogo width={110} opacity={0.5}/>
        </div>
      </div>
    </PhoneScreen>
  );
}
