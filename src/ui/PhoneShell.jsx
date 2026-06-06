// src/ui/PhoneShell.jsx — wrapper visual: full-screen en mobile,
// marco de teléfono centrado en desktop. Las rutas renderizan adentro.

import React from 'react';
import HpjLogo from './HpjLogo.jsx';

function ShellLogo() {
  return (
    <div
      className="hpj-shell-logo"
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        flexDirection: 'column', alignItems: 'center', gap: 10,
        pointerEvents: 'none', userSelect: 'none',
      }}
    >
      <HpjLogo width={80} color="rgba(161,125,35,0.45)" opacity={1}/>
    </div>
  );
}

export function PhoneShell({ children }) {
  return (
    <div className="hpj-app-root">
      <ShellLogo/>
      <div className="hpj-phone hpj">
        <div className="hpj-screen-host">
          {children}
        </div>
      </div>
    </div>
  );
}
