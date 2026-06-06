// src/roles/reception/Chat.jsx — Chat con huésped (estilo WhatsApp).
// Migrado de screens-reception.jsx::ReceptionChat.
// · Por ahora estático. Cuando exista tabla `messages` en el store, lo
//   conectas igual que en concierge/Chat.jsx.

import React from 'react';
import {
  PhoneScreen, Body, Avatar, IconBtn, Bubble, DayStamp, SystemNote, BackBtn,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';

export default function ReceptionChat() {
  return (
    <PhoneScreen>
      <div style={{
        padding: '14px 18px 12px', background: 'var(--card)',
        borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <BackBtn label="" />
        <Avatar name="Carolina Mendoza" size={36} tone="brass"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Carolina Mendoza · 304</div>
          <div style={{ fontSize: 11, color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="dot dot-ok"/> En línea · WhatsApp
          </div>
        </div>
        <IconBtn icon={I.phone}/>
      </div>

      <Body style={{ background: 'var(--bg-deep)', padding: '14px 14px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <DayStamp text="Hoy · lunes 13 de mayo"/>
        <Bubble side="them" text="Hola, buenas tardes. Una pregunta — ¿podríamos llegar a las 15:00 en vez de 16:30?" time="13:14"/>
        <SystemNote text="Recepción reasignó tarea a Limpieza · ETA 14:50"/>
        <Bubble side="me" text="Por supuesto, Sra. Mendoza. Adelantamos la limpieza de su habitación — estaríamos listos a las 14:50. ¿Le parece bien?" time="13:18" read/>
        <Bubble side="them" text="Perfecto, mil gracias 🙏" time="13:19"/>
        <Bubble side="me" text="Su llave digital se enviará a este número 10 min antes del check-in." time="13:24" read/>
      </Body>

      <div style={{
        padding: '8px 12px 16px', background: 'var(--card)',
        borderTop: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <IconBtn icon={I.attach}/>
        <div style={{
          flex: 1, height: 38, borderRadius: 999, padding: '0 14px',
          background: 'var(--bg)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--muted-2)',
        }}>Respuesta sugerida: "Confirmado…"</div>
        <IconBtn icon={I.send} style={{ background: 'var(--forest)', color: 'var(--bg)', border: 'none' }}/>
      </div>
    </PhoneScreen>
  );
}
