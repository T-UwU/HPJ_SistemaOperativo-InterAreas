// src/roles/maintenance/Detail.jsx — Detalle de ticket con acuse de recibido y comentarios.

import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  PhoneScreen, Body, Eyebrow, Card, Pill, Avatar, BackBtn, RoleChip,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useTickets, useActions } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';
import CommentThread from '../../ui/CommentThread.jsx';

export default function MaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tickets = useTickets();
  const user = useCurrentUser();
  const { acceptTicket, closeTicket, ackTicket, pauseTicket } = useActions();

  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return <Navigate to="/maintenance" replace />;

  const isAccepted = ticket.status === 'aceptado';
  const isOpen     = ticket.status === 'abierto';
  const isClosed   = ticket.status === 'cerrado';
  const myAck      = ticket.acks?.maintenance;

  const primaryAction = () => {
    if (isOpen) {
      acceptTicket(ticket.id);
    } else if (isAccepted) {
      closeTicket(ticket.id);
      navigate('/maintenance');
    }
  };

  const handleAck = () => {
    if (!myAck) ackTicket(ticket.id, 'maintenance');
  };

  const slaUrgent = typeof ticket.sla === 'string' && ticket.sla.startsWith('00:');

  return (
    <PhoneScreen>
      {/* Encabezado */}
      <div style={{ padding: '12px 18px 14px', background: '#3A2722', color: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <BackBtn label="Tickets"/>
          <span className="hpj-mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.06em' }}>
            #{ticket.id}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div className="hpj-serif" style={{ fontSize: ticket.room?.length > 6 ? 22 : 44, lineHeight: 1.1 }}>{ticket.room}</div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 999,
              background:
                ticket.priority === 'alta'  ? 'var(--danger)' :
                ticket.priority === 'media' ? 'var(--warn)'   : 'var(--muted-2)',
              color: '#fff', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
            }}>
              {ticket.priority === 'alta' && '⚠ '}
              {ticket.priority.toUpperCase()}
            </span>
            <div style={{ fontSize: 14, marginTop: 8 }}>{ticket.desc}</div>
          </div>
        </div>
        <div style={{
          marginTop: 14, padding: '10px 12px',
          background: 'rgba(255,255,255,0.08)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              SLA restante
            </div>
            <div className="hpj-mono" style={{
              fontSize: 22, fontWeight: 500,
              color: slaUrgent ? 'var(--brass)' : '#fff',
            }}>{ticket.sla}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>
              Reportado
            </div>
            <div className="hpj-mono" style={{ fontSize: 14, textAlign: 'right' }}>
              {ticket.reportedAt || '—'}
            </div>
          </div>
        </div>
      </div>

      <Body style={{ paddingBottom: 80 }}>
        {/* Acuse de recibido */}
        <Eyebrow>Acuse de recibido</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          {myAck ? (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--ok-soft)', border: '1px solid var(--ok)',
              fontSize: 13, color: 'var(--ok)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>{I.check}</span>
              Visto por Mantenimiento ·{' '}
              {new Date(myAck).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAck}>
              Confirmar recibido
            </button>
          )}
        </div>

        {/* Descripción */}
        <Eyebrow>Descripción</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <Card style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Avatar name={ticket.reporter || 'Sistema'} size={24}/>
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {ticket.reporter || 'Sistema'} · {ticket.reportedBy || '—'}
              </span>
              <span className="hpj-mono" style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>
                {ticket.reportedAt || '—'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {ticket.desc}
            </div>
          </Card>
        </div>

        {/* Evidencia fotográfica */}
        {ticket.photos?.length > 0 && (
          <>
            <Eyebrow>Evidencia fotográfica</Eyebrow>
            <div style={{ padding: '0 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ticket.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Evidencia ${i + 1}`}
                    style={{
                      width: 96, height: 96, objectFit: 'cover',
                      borderRadius: 10, border: '1px solid var(--line)',
                      display: 'block',
                    }}
                  />
                </a>
              ))}
            </div>
          </>
        )}

        {/* Comentarios contextuales */}
        <CommentThread entityType="ticket" entityId={ticket.id}/>
      </Body>

      {/* Acciones principales */}
      {isClosed ? (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--line-soft)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'var(--ok)', fontSize: 16 }}>{I.check}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ok)' }}>Ticket resuelto</div>
            {ticket.closedAt && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                {new Date(ticket.closedAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/maintenance')}>
            Volver
          </button>
        </div>
      ) : (
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--line-soft)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          {isAccepted && (
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { pauseTicket(ticket.id); navigate('/maintenance'); }}>
              Pausar
            </button>
          )}
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={primaryAction}>
            {isOpen     && 'Aceptar · en camino'}
            {isAccepted && 'Marcar como resuelto →'}
          </button>
        </div>
      )}
    </PhoneScreen>
  );
}

