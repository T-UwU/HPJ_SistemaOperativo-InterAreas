// src/App.jsx — Router raíz + bootstrap de sesión.

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth, ROLES } from './store/auth.js';
import { useChat } from './store/chat.js';
import { useActivity } from './store/activity.js';
import { useData } from './store/data.js';
import { PhoneShell } from './ui/PhoneShell.jsx';
import HpjLogo from './ui/HpjLogo.jsx';
import { RequireAuth } from './routes/RequireAuth.jsx';

import Login from './pages/Login.jsx';

import ReceptionRoutes    from './roles/reception/index.jsx';
import HousekeepingRoutes from './roles/housekeeping/index.jsx';
import SalesRoutes        from './roles/sales/index.jsx';
import MaintenanceRoutes  from './roles/maintenance/index.jsx';
import PurchasingRoutes   from './roles/purchasing/index.jsx';
import TIRoutes           from './roles/ti/index.jsx';

function RootRedirect() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLES[user.roleId].home} replace />;
}

// Splash mientras la sesión se rehidrata (solo aparece en modo online)
function Splash() {
  return (
    <div className="hpj" style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: 20,
    }}>
      <HpjLogo width={140}/>
      <div style={{
        width: 18, height: 18,
        border: '2px solid var(--line)', borderTopColor: 'var(--brass)',
        borderRadius: '50%', animation: 'spin 0.9s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const initSession  = useAuth((s) => s.initSession);
  const initChat     = useChat((s) => s.init);
  const initActivity = useActivity((s) => s.init);
  const hydrateData  = useData((s) => s.actions.hydrate);
  const loading = useAuth((s) => s.loading);

  useEffect(() => {
    initSession();
    initChat();
    initActivity();
    hydrateData();
  }, []);

  return (
    <BrowserRouter>
      <PhoneShell>
        {loading ? <Splash /> : (
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            <Route path="/reception/*" element={
              <RequireAuth role="reception"><ReceptionRoutes /></RequireAuth>
            }/>
            <Route path="/housekeeping/*" element={
              <RequireAuth role="housekeeping"><HousekeepingRoutes /></RequireAuth>
            }/>
            <Route path="/sales/*" element={
              <RequireAuth role="sales"><SalesRoutes /></RequireAuth>
            }/>
            <Route path="/maintenance/*" element={
              <RequireAuth role="maintenance"><MaintenanceRoutes /></RequireAuth>
            }/>
            <Route path="/purchasing/*" element={
              <RequireAuth role="purchasing"><PurchasingRoutes /></RequireAuth>
            }/>
            <Route path="/ti/*" element={
              <RequireAuth role="ti"><TIRoutes /></RequireAuth>
            }/>

            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </PhoneShell>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="hpj" style={{
      padding: 32, height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    }}>
      <div>
        <div className="hpj-serif" style={{ fontSize: 36, color: 'var(--ink-2)' }}>404</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>Esta página no existe.</div>
        <a href="/" style={{
          display: 'inline-block', marginTop: 18,
          color: 'var(--forest)', fontSize: 13, fontWeight: 500,
          textDecoration: 'underline', textUnderlineOffset: 4,
        }}>Volver al inicio</a>
      </div>
    </div>
  );
}
