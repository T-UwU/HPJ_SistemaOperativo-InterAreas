// src/roles/housekeeping/Evidence.jsx — Inspección final con evidencia fotográfica.

import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  PhoneScreen, BrandStrip, AppBar, Body, Eyebrow, Pill, BackBtn, Icon,
} from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';
import { useTasks, useActions } from '../../store/data.js';
import { useEvidence } from '../../store/evidence.js';

// Bloques de evidencia por tipo de tarea (fotos del estado FINAL)
const BLOCKS_BY_TYPE = {
  'general':      ['Área barrida y trapeada', 'Superficies limpias', 'Estado final'],
  'profunda':     ['Desinfección completa', 'Vidrios y espejos', 'Mobiliario y esquinas', 'Estado final'],
  'post-evento':  ['Basura retirada', 'Mesas y sillas acomodadas', 'Área trapeada', 'Estado final'],
  'sanitizacion': ['Superficies sanitizadas', 'Área ventilada', 'Estado final'],
  'reposicion':   ['Suministros repuestos', 'Stock verificado', 'Estado final'],
  default:        ['Estado del área', 'Estado final'],
};

export default function HousekeepingEvidence() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const tasks      = useTasks();
  const { completeTask } = useActions();

  // photos: { [blockIndex]: { file: File, preview: string } }
  const [photos,    setPhotos]    = useState({});
  const [uploading, setUploading] = useState(false);

  const submitEvidence = useEvidence((s) => s.submit);

  const task = tasks.find((t) => t.id === id);
  if (!task) return <Navigate to="/housekeeping" replace />;

  const isVIP      = task.tags?.includes('VIP');
  const baseBlocks = BLOCKS_BY_TYPE[task.type] || BLOCKS_BY_TYPE.default;
  const blocks     = isVIP ? [...baseBlocks, 'Cortesía VIP · colocada'] : baseBlocks;

  const handlePhoto = (idx, file) => {
    const preview = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [idx]: { file, preview } }));
  };

  const handleDeliver = async () => {
    setUploading(true);
    if (Object.keys(photos).length > 0) {
      const files = Object.values(photos).map((p) => p.file);
      await submitEvidence(task.room, task.id, files);
    }
    completeTask(task.id);
    navigate('/housekeeping');
  };

  const photoCount   = Object.keys(photos).length;
  const noteText = task.note || `${task.typeLabel || task.type} · ${task.room} lista para entrega.`;

  return (
    <PhoneScreen>
      <BrandStrip role="housekeeping"/>
      <AppBar
        eyebrow={`${task.room} · ${task.typeLabel || task.type}`}
        title="Inspección final"
      />
      <Body style={{ paddingBottom: 80 }}>
        <div style={{ padding: '4px 16px 0' }}>
          <BackBtn label="Tarea"/>
        </div>

        <Eyebrow right={photoCount > 0 ? `${photoCount} foto${photoCount > 1 ? 's' : ''}` : undefined}>
          Evidencia fotográfica
        </Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {blocks.map((label, i) => (
            <EvidenceBlock
              key={i}
              label={label}
              photo={photos[i]?.preview}
              onPhoto={(file) => handlePhoto(i, file)}
            />
          ))}
        </div>

        <Eyebrow>Nota de entrega</Eyebrow>
        <div style={{ padding: '0 16px' }}>
          <div style={{
            padding: 12, borderRadius: 12, background: 'var(--card)',
            border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-2)',
            lineHeight: 1.5,
          }}>
            {noteText}
            {task.tags?.includes('Sin frutos secos') && (
              <div style={{ marginTop: 6, color: 'var(--danger)', fontWeight: 500, fontSize: 12 }}>
                ⚠ Alergia frutos secos — verificado sin productos con nueces
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} disabled={uploading} onClick={() => navigate(-1)}>
            Pedir revisión
          </button>
          <button className="btn btn-primary" style={{ flex: 2, opacity: uploading ? 0.6 : 1 }} disabled={uploading} onClick={handleDeliver}>
            {uploading ? 'Subiendo fotos…' : 'Entregar a Recepción ✓'}
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function EvidenceBlock({ label, photo, onPhoto }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onPhoto(file);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {photo
          ? <Pill kind="ok" style={{ height: 18, fontSize: 10 }}>FOTO TOMADA</Pill>
          : <Pill kind="warn" style={{ height: 18, fontSize: 10 }}>PENDIENTE</Pill>
        }
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      {photo ? (
        <div
          style={{
            position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden',
            border: '1.5px solid var(--ok)', cursor: 'pointer',
          }}
          onClick={() => fileRef.current?.click()}
        >
          <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{
            position: 'absolute', bottom: 6, right: 8,
            padding: '2px 8px', borderRadius: 999,
            background: 'rgba(0,0,0,0.45)', color: '#fff',
            fontSize: 10, fontFamily: 'var(--mono)',
          }}>
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · toca para cambiar
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', aspectRatio: '4/3', borderRadius: 10,
            background: 'var(--card-2)', border: '1.5px dashed var(--hairline)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', gap: 8, fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <span style={{ color: 'var(--brass)', fontSize: 22 }}>{I.cam}</span>
          Tomar foto
        </button>
      )}
    </div>
  );
}
