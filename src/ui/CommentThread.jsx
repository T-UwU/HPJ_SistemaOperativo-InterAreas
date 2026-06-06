// src/ui/CommentThread.jsx — Comentarios contextuales sobre un objeto del store.
// Uso: <CommentThread entityType="ticket" entityId="M-217"/>
// La conversación queda atada al dato, nunca separada en un chat genérico.

import React, { useState } from 'react';
import { useComments, useActions } from '../store/data.js';
import { useCurrentUser } from '../store/auth.js';
import { Eyebrow, Avatar } from './shared.jsx';
import { I } from './icons.jsx';

const ROLE_COLOR = {
  reception:    'var(--brass)',
  housekeeping: 'var(--info)',
  sales:        '#7C5F8A',
  maintenance:  'var(--danger)',
  purchasing:   '#2D6A4F',
};

export default function CommentThread({ entityType, entityId }) {
  const user     = useCurrentUser();
  const comments = useComments(entityType, entityId);
  const { addComment } = useActions();
  const [body, setBody] = useState('');

  const send = () => {
    const texto = body.trim();
    if (!texto) return;
    addComment({
      entityType, entityId,
      author: user?.name || 'Anónimo',
      role:   user?.roleId || 'reception',
      body:   texto,
    });
    setBody('');
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <Eyebrow right={comments.length > 0 ? `${comments.length}` : undefined}>
        Comentarios
      </Eyebrow>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comments.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0' }}>
            Sin comentarios. Sé el primero en agregar uno.
          </div>
        )}
        {comments.map((c) => (
          <CommentBubble key={c.id} comment={c} isMe={c.role === user?.roleId}/>
        ))}
      </div>

      <div style={{ padding: '8px 16px 16px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKey}
          placeholder="Agrega un comentario…"
          rows={2}
          style={{
            flex: 1, padding: '10px 12px', fontSize: 13, lineHeight: 1.45,
            background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 10, fontFamily: 'inherit', color: 'var(--ink)',
            resize: 'none', outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={!body.trim()}
          style={{
            width: 38, height: 38, borderRadius: 999,
            background: body.trim() ? 'var(--forest)' : 'var(--card-2)',
            border: 'none', color: body.trim() ? 'var(--bg)' : 'var(--muted-2)',
            cursor: body.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >{I.send}</button>
      </div>
    </>
  );
}

function CommentBubble({ comment, isMe }) {
  const color = ROLE_COLOR[comment.role] || 'var(--ink-3)';
  const time  = new Date(comment.at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Avatar name={comment.author} size={28} tone={isMe ? 'forest' : 'brass'}/>
      <div style={{
        flex: 1, padding: '8px 12px',
        background: isMe ? 'var(--forest-soft)' : 'var(--card)',
        border: `1px solid ${isMe ? 'var(--forest)' : 'var(--line)'}`,
        borderRadius: 10, borderTopLeftRadius: isMe ? 10 : 4,
        borderTopRightRadius: isMe ? 4 : 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color }}>{comment.author}</span>
          <span className="hpj-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{time}</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--ink)' }}>{comment.body}</div>
      </div>
    </div>
  );
}
