// src/roles/ti/index.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TIHome from './Home.jsx';

export default function TIRoutes() {
  return (
    <Routes>
      <Route index element={<TIHome />} />
    </Routes>
  );
}
