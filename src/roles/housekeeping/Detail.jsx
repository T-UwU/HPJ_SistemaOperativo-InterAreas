// src/roles/housekeeping/Detail.jsx — Detalle de tarea con checklist.

import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  PhoneScreen, Body, Eyebrow, Pill, BackBtn, Icon,
} from '../../ui/shared.jsx';
import { useTasks, useActions } from '../../store/data.js';
import { useCurrentUser } from '../../store/auth.js';

const CHECKLIST_BY_TYPE = {
  'post-evento': [
    'Retirar vasos, platos y desechos',
    'Limpiar mesas y manteles',
    'Barrer y trapear el área',
    'Limpiar baños del área',
    'Reponer papel, jabón y toallas',
    'Acomodar sillas y mesas',
    'Inspección final',
  ],
  'profunda': [
    'Mover mobiliario para limpieza',
    'Desinfección de superficies',
    'Limpieza de vidrios y espejos',
    'Aspirado de tapicería',
    'Trapeado con solución',
    'Reposición de suministros',
    'Inspección final',
  ],
  'sanitizacion': [
    'Aplicar solución sanitizante en superficies',
    'Sanitizar manijas, barandales y contactos',
    'Ventilación del área',
    'Registro de sanitización',
    'Inspección final',
  ],
  'reposicion': [
    'Verificar stock de suministros',
    'Reponer papel y jabón',
    'Reponer amenities (si aplica)',
    'Registrar lo reabastecido',
    'Inspección final',
  ],
  default: [
    'Barrer y aspirar el área',
    'Limpiar superficies y mobiliario',
    'Limpiar baños (si aplica)',
    'Reponer suministros',
    'Inspección final',
  ],
};

export default function HousekeepingDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const tasks    = useTasks();
  const { progressTask, startTask, pauseTask } = useActions();
  const user     = useCurrentUser();

  const task = tasks.find((t) => t.id === id);
  if (!task) return <Navigate to="/housekeeping" replace />;

  const items    = CHECKLIST_BY_TYPE[task.type] || CHECKLIST_BY_TYPE.default;
  const total    = task.total || items.length;
  const progress = task.progress || 0;

  const handleNext = () => {
    if (task.status === 'pendiente') {
      startTask(task.id, user?.name || 'Limpieza');
    }
    const newProgress = progress + 1;
    if (newProgress >= total) {
      navigate(`/housekeeping/evidence/${task.id}`);
    } else {
      progressTask(task.id, newProgress);
    }
  };

  return (
    <PhoneScreen>
      <div style={{
        padding: '12px 18px 14px', background: 'var(--forest-deep)', color: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <BackBtn label="Mis tareas"/>
          <span className="hpj-mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.06em' }}>{task.id}</span>
        </div>
        <div className="hpj-serif" style={{ fontSize: 24, lineHeight: 1.1, color: 'var(--bg)', fontWeight: 500 }}>
          {task.room}
        </div>
        <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>{task.typeLabel || task.type}</div>
        {task.note && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{task.note}</div>}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <span className="pill pill-brass" style={{ background: 'var(--brass)', color: '#FAF4E6' }}>
            {task.status === 'en-curso' ? `EN CURSO · ${progress}/${total}` : 'PENDIENTE'}
          </span>
        </div>
      </div>

      <Body style={{ paddingBottom: 80 }}>
        <Eyebrow right={`${progress} de ${total}`}>Checklist · {task.typeLabel || task.type}</Eyebrow>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((text, i) => {
            const isDone   = i < progress;
            const isActive = i === progress;
            return <CheckItem key={i} text={text} done={isDone} active={isActive}/>;
          })}
        </div>

        {task.note && (
          <>
            <Eyebrow>Notas</Eyebrow>
            <div style={{ padding: '0 16px' }}>
              <div style={{
                padding: 12, borderRadius: 10, background: 'var(--card-2)',
                border: '1px solid var(--line)', fontSize: 12, lineHeight: 1.5,
              }}>
                {task.note}
              </div>
            </div>
          </>
        )}

        <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { pauseTask(task.id); navigate('/housekeeping'); }}>Pausar</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleNext}>
            {progress + 1 >= total ? 'Completar tarea ✓' : `Siguiente paso (${progress + 1}/${total}) →`}
          </button>
        </div>
      </Body>
    </PhoneScreen>
  );
}

function CheckItem({ text, done, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        background: done ? 'var(--forest)' : active ? 'var(--brass-soft)' : 'var(--card)',
        border: `1.5px solid ${done ? 'var(--forest)' : active ? 'var(--brass)' : 'var(--hairline)'}`,
        color: done ? 'var(--bg)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done   && <Icon size={14} d={<path d="M4 12l5 5L20 6"/>} sw={2.5}/>}
        {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brass)' }}/>}
      </span>
      <span style={{
        flex: 1, fontSize: 13,
        color: done ? 'var(--muted-2)' : 'var(--ink)',
        textDecoration: done ? 'line-through' : 'none',
        fontWeight: active ? 500 : 400,
      }}>{text}</span>
      {active && <Pill kind="brass" style={{ height: 18, fontSize: 10 }}>AHORA</Pill>}
    </div>
  );
}
