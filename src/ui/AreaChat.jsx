// src/ui/AreaChat.jsx — Chat interno entre áreas del hotel.
// Componente compartido; cada rol lo importa pasando su `role`.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneScreen, BrandStrip } from './shared.jsx';
import { I } from './icons.jsx';
import { useChat } from '../store/chat.js';
import { useCurrentUser, ROLES } from '../store/auth.js';
import { isOnlineMode } from '../lib/supabase.js';

function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

function fmtDay(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  } catch { return ''; }
}

export default function AreaChat({ role }) {
  const navigate    = useNavigate();
  const user        = useCurrentUser();
  const { messages, send, markRead, init } = useChat();
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    init();
    markRead();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    markRead();
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending || !user) return;
    setSending(true);
    await send(user.roleId, user.name, text);
    setText('');
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Agrupa mensajes por día, insertando separadores
  const items = [];
  let lastDay = null;
  for (const m of messages) {
    const day = (m.created_at || '').slice(0, 10);
    if (day && day !== lastDay) {
      items.push({ type: 'stamp', day, label: fmtDay(m.created_at) });
      lastDay = day;
    }
    items.push({ type: 'msg', ...m });
  }

  const roleColor = (r) => ROLES[r]?.color || 'var(--ink-3)';
  const roleLabel = (r) => ROLES[r]?.label || r;

  return (
    <PhoneScreen>
      <BrandStrip role={role}/>

      {/* Header */}
      <div style={{
        padding: '10px 16px 12px', borderBottom: '1px solid var(--line-soft)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', padding: 0 }}
        >{I.chevL}</button>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Chat de áreas</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            Ventas · Recepción · Mantenimiento · Limpieza · Compras
          </div>
        </div>
        {!isOnlineMode && (
          <span style={{
            marginLeft: 'auto', fontSize: 9, letterSpacing: '0.06em',
            padding: '3px 7px', borderRadius: 999,
            background: 'var(--warn-soft)', color: 'var(--warn)',
          }}>DEMO</span>
        )}
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--muted)', fontSize: 13 }}>
            Sin mensajes aún.<br/>
            <span style={{ fontSize: 11 }}>Sé el primero en escribir al equipo.</span>
          </div>
        )}
        {items.map((item, i) => {
          if (item.type === 'stamp') {
            return (
              <div key={`d-${item.day}`} style={{ textAlign: 'center', margin: '4px 0' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 10,
                  background: 'var(--card-2)', color: 'var(--muted)',
                  letterSpacing: '0.04em',
                }}>{item.label}</span>
              </div>
            );
          }

          const isMe = item.from_role === user?.roleId;
          const color = roleColor(item.from_role);

          return (
            <div key={item.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}>
              {!isMe && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: color, display: 'inline-block' }}/>
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>
                    {item.from_name} · {roleLabel(item.from_role)}
                  </span>
                </div>
              )}
              <div style={{
                maxWidth: '80%', padding: '8px 12px 6px',
                background: isMe ? color : 'var(--card)',
                color: isMe ? '#fff' : 'var(--ink)',
                borderRadius: 14,
                borderBottomRightRadius: isMe ? 4 : 14,
                borderBottomLeftRadius:  isMe ? 14 : 4,
                border: isMe ? 'none' : '1px solid var(--line)',
                fontSize: 13, lineHeight: 1.45,
              }}>
                {item.body}
                <div style={{ fontSize: 10, opacity: 0.55, marginTop: 4, textAlign: 'right' }}>
                  {fmtTime(item.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding: '8px 10px 12px', background: 'var(--card)',
        borderTop: '1px solid var(--line-soft)',
        display: 'flex', gap: 8, alignItems: 'flex-end',
      }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe un mensaje…"
          rows={1}
          style={{
            flex: 1, resize: 'none', padding: '10px 12px',
            border: '1px solid var(--line)', borderRadius: 12,
            background: 'var(--bg)', color: 'var(--ink)',
            fontFamily: 'inherit', fontSize: 13, outline: 'none',
            lineHeight: 1.4, maxHeight: 100, overflowY: 'auto',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--forest)')}
          onBlur={(e)  => (e.target.style.borderColor = 'var(--line)')}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: 999, border: 'none',
            cursor: text.trim() && !sending ? 'pointer' : 'default',
            background: text.trim() && !sending ? 'var(--forest)' : 'var(--line)',
            color: text.trim() && !sending ? '#fff' : 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >{I.arrow}</button>
      </div>
    </PhoneScreen>
  );
}
