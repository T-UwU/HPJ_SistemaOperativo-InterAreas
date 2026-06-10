// src/roles/housekeeping/Report.jsx — Reportar incidencia → Mantenimiento + Recepción.

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, RoleChip, BackBtn,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useActions, useRooms, useAreas } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';
import { supabase, isOnlineMode } from '../../lib/supabase.js';
import { TICKET_CATEGORIES } from '../../ui/categoryIcons.jsx';

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(ticketId, file, index) {
  const ext  = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `tickets/${ticketId}/${index}.${ext}`;
  const { error } = await supabase.storage
    .from('evidence')
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) throw error;
  return supabase.storage.from('evidence').getPublicUrl(path).data.publicUrl;
}

const CATEGORIES = TICKET_CATEGORIES;

const PRIORITIES = ['baja', 'media', 'alta'];
const SLA_MAP    = { alta: '01:00', media: '04:00', baja: '24:00' };

export default function HousekeepingReport() {
  const navigate       = useNavigate();
  const user           = useCurrentUser();
  const { addTicket }  = useActions();
  const rooms          = useRooms();
  const HOTEL_AREAS    = useAreas();

  const [locType,  setLocType]  = useState('habitacion');
  const [room,     setRoom]     = useState('');
  const [area,     setArea]     = useState('');
  const [category, setCategory] = useState('plomeria');
  const [priority, setPriority] = useState('media');
  const [desc,     setDesc]     = useState('');
  const [notifyReception, setNotifyReception] = useState(true);
  const [photos,   setPhotos]   = useState([]); // [{ file, preview }]
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const location   = locType === 'habitacion' ? room : area;
  const locLabel   = locType === 'habitacion'
    ? (room ? `Hab. ${room}` : '')
    : (HOTEL_AREAS.find((a) => a.id === area)?.label || area);

  const canSend = location !== '' && desc.trim() !== '';

  const addPhoto = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    files.slice(0, remaining).forEach((file) => {
      const preview = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { file, preview }]);
    });
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const send = async () => {
    if (!canSend || uploading) return;
    setUploading(true);
    const ticketId = `TICK-${Date.now()}`;
    const cat = CATEGORIES.find((c) => c.id === category);

    let photoUrls = [];
    if (photos.length > 0) {
      try {
        if (isOnlineMode && supabase) {
          photoUrls = await Promise.all(
            photos.map(({ file }, i) => uploadPhoto(ticketId, file, i))
          );
        } else {
          photoUrls = await Promise.all(photos.map(({ file }) => fileToDataUrl(file)));
        }
      } catch {
        photoUrls = await Promise.all(photos.map(({ file }) => fileToDataUrl(file)));
      }
    }

    addTicket({
      id: ticketId,
      room: locType === 'habitacion' ? room : (HOTEL_AREAS.find((a) => a.id === area)?.label || area),
      category: cat.label,
      desc: desc.trim(),
      reportedBy: 'housekeeping',
      reporter: user?.name || 'Limpieza',
      sla: SLA_MAP[priority],
      status: 'abierto',
      priority,
      reportedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      notifyReception,
      photos: photoUrls,
    });
    navigate('/housekeeping');
  };

  return (
    <PhoneScreen>
      <BrandStrip role="housekeeping"/>
      <AppBar
        eyebrow="Crear ticket → Mantenimiento"
        title="Reportar incidencia"
        leading={<BackBtn label=""/>}
      />
      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Selector tipo de ubicación */}
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Ubicación</div>
            <div style={{
              display: 'flex', padding: 3, borderRadius: 10,
              background: 'var(--card-2)', marginBottom: 8,
            }}>
              {[['habitacion','Habitación'],['area','Área / Salón']].map(([val, lbl]) => (
                <button key={val} onClick={() => { setLocType(val); setRoom(''); setArea(''); }} style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                  background: locType === val ? 'var(--card)' : 'transparent',
                  color:      locType === val ? 'var(--ink)'  : 'var(--muted)',
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  boxShadow: locType === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit',
                }}>{lbl}</button>
              ))}
            </div>

            {locType === 'habitacion' ? (
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="card"
                style={{ width: '100%', padding: 12, fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Selecciona habitación…</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>Hab. {r.id} · Piso {r.floor} · {r.type}</option>
                ))}
              </select>
            ) : (
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="card"
                style={{ width: '100%', padding: 12, fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Selecciona área…</option>
                {HOTEL_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Categoría */}
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Categoría</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  padding: 12, borderRadius: 12,
                  background: category === c.id ? 'var(--forest)' : 'var(--card)',
                  border: `1px solid ${category === c.id ? 'var(--forest)' : 'var(--line)'}`,
                  color: category === c.id ? 'var(--bg)' : 'var(--ink)',
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <span style={{ color: category === c.id ? 'var(--brass-soft)' : 'var(--brass-deep)' }}>{c.icon}</span>
                  {CATEGORIES.find(x => x.id === c.id)?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Prioridad</div>
            <div style={{ display: 'flex', padding: 3, borderRadius: 10, background: 'var(--card-2)' }}>
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriority(p)} style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                  background: priority === p ? 'var(--card)' : 'transparent',
                  color:      priority === p ? 'var(--ink)'  : 'var(--muted)',
                  borderRadius: 8, fontSize: 12, fontWeight: 500,
                  boxShadow: priority === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: 'inherit', textTransform: 'capitalize',
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Descripción</div>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="card"
              placeholder="Describe el problema con detalle…"
              style={{
                width: '100%', padding: 12, fontSize: 13, color: 'var(--ink-2)',
                minHeight: 90, lineHeight: 1.5, resize: 'vertical',
                fontFamily: 'inherit', border: '1px solid var(--line)',
              }}
            />
          </div>

          {/* Notificaciones */}
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>Notificar a</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Mantenimiento siempre ON */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10,
                opacity: 0.7,
              }}>
                <RoleChip role="maintenance"/>
                <div style={{ flex: 1, fontSize: 12 }}>Mantenimiento · siempre notificado</div>
                <div style={{ width: 32, height: 18, borderRadius: 999, background: 'var(--forest)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 2, left: 16, width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }}/>
                </div>
              </div>

              {/* Recepción toggle funcional */}
              <button onClick={() => setNotifyReception((v) => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <RoleChip role="reception"/>
                <div style={{ flex: 1, fontSize: 12 }}>
                  Recepción · {notifyReception ? 'será notificada' : 'sin notificación'}
                </div>
                <div style={{
                  width: 32, height: 18, borderRadius: 999,
                  background: notifyReception ? 'var(--forest)' : 'var(--hairline)',
                  position: 'relative', transition: 'background .15s',
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: notifyReception ? 16 : 2,
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.25)', transition: 'left .15s',
                  }}/>
                </div>
              </button>
            </div>
          </div>

          {/* Evidencia fotográfica */}
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 8 }}>
              Evidencia fotográfica
              <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>
                opcional · máx. 3 fotos
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {photos.map(({ preview }, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img
                    src={preview}
                    alt=""
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }}
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--danger)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >×</button>
                </div>
              ))}

              {photos.length < 3 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: 80, height: 80, borderRadius: 10,
                    border: '1.5px dashed var(--line)', background: 'var(--card)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4,
                    color: 'var(--muted)',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{I.cam}</span>
                  <span style={{ fontSize: 10 }}>Añadir</span>
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              style={{ display: 'none' }}
              onChange={addPhoto}
            />
          </div>

        </div>

        <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancelar</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2, opacity: canSend && !uploading ? 1 : 0.4 }}
            disabled={!canSend || uploading}
            onClick={send}
          >
            {uploading ? 'Subiendo…' : 'Enviar ticket'}
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}
