// src/ui/HpjLogo.jsx — Logo completo en SVG puro.
// textLength garantiza que los tres elementos tengan exactamente el mismo ancho.

import React from 'react';

// Las polylines van de x=25 a x=303 → span de 278 unidades.
// Con stroke-width=20 y linecap=round el borde visual llega a x≈15 y x≈313.
// Usamos esos límites como textLength para que el texto rasante iguale visualmente.
const TEXT_X    = 164;   // midpoint de 15–313
const TEXT_LEN  = 298;   // 313 - 15

export default function HpjLogo({ width = 120, color = 'var(--brass)', opacity = 1 }) {
  // ViewBox: 339 ancho × 268 alto (196 para las líneas + 72 para el texto)
  const vbH   = 268;
  const svgH  = Math.round(width * (vbH / 339));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 339 ${vbH}`}
      width={width}
      height={svgH}
      style={{ opacity, display: 'block' }}
    >
      {/* Símbolo */}
      <g fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="25,48 65,78 100,51 131,76 174,42 220,74 261,55 303,89"/>
        <polyline points="25,114 69,139 104,124 132,141 162,122 185,137 218,122 241,135 271,120 302,137"/>
      </g>

      {/* PALACIOJULIOHOTEL */}
      <text
        x={TEXT_X}
        y="223"
        textAnchor="middle"
        textLength={TEXT_LEN}
        lengthAdjust="spacing"
        fontFamily="'Josefin Sans', sans-serif"
        fontWeight="300"
        fontSize="22"
        fill={color}
        letterSpacing="1"
      >
        PALACIOJULIOHOTEL
      </text>

      {/* CENTRO HISTÓRICO PUEBLA MÉXICO */}
      <text
        x={TEXT_X}
        y="252"
        textAnchor="middle"
        textLength={TEXT_LEN}
        lengthAdjust="spacing"
        fontFamily="'Barlow Condensed', sans-serif"
        fontWeight="400"
        fontSize="14"
        fill={color}
        letterSpacing="1"
      >
        CENTRO HISTÓRICO PUEBLA MÉXICO
      </text>
    </svg>
  );
}
