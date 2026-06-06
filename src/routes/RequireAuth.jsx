// src/routes/RequireAuth.jsx — guard de ruta.
// · Si no hay sesión, manda a /login.
// · Si la ruta es de otro rol, manda al home del rol actual.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../store/auth.js';

export function RequireAuth({ role, children }) {
  const user = useAuth((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Si la ruta exige un rol específico y el usuario actual es otro,
  // lo regresamos a SU home (no le mostramos pantallas de otro rol).
  if (role && user.roleId !== role) {
    return <Navigate to={ROLES[user.roleId].home} replace />;
  }

  return children;
}
