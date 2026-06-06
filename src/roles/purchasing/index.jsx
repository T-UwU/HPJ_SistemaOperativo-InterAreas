// src/roles/purchasing/index.jsx — Layout del rol Compras.
// Patrón mínimo: TabBar con 2 pestañas, shell con Outlet.

import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';

import PurchasingRequisitions from './Requisitions.jsx';
import NewRequisition         from './NewRequisition.jsx';
import RoleMe                 from '../../ui/RoleMe.jsx';
import AreaChat               from '../../ui/AreaChat.jsx';
import Notifications          from '../../ui/Notifications.jsx';
import { EventsList, EventDetail } from '../../ui/EventsCalendar.jsx';
import { useActivityUnread }  from '../../store/activity.js';
import { useCurrentUser }     from '../../store/auth.js';

function PurchasingShell() {
  const { pathname } = useLocation();
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);

  const hideTabs =
    pathname.includes('/new')           ||
    pathname.includes('/chat')          ||
    pathname.includes('/notifications') ||
    pathname.includes('/events/');

  const tabs = [
    { id: 'reqs',   label: 'Pedidos', icon: I.pkg,  to: '/purchasing' },
    { id: 'events', label: 'Eventos', icon: I.cal,  to: '/purchasing/events' },
    { id: 'chat',   label: 'Chat',    icon: I.msg,  to: '/purchasing/chat' },
    { id: 'me',     label: 'Yo',      icon: I.user, to: '/purchasing/me',
      badge: actUnread || undefined },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      {!hideTabs && <TabBar items={tabs} />}
    </div>
  );
}

export default function PurchasingRoutes() {
  return (
    <Routes>
      <Route element={<PurchasingShell />}>
        <Route index                 element={<PurchasingRequisitions />} />
        <Route path="new"            element={<NewRequisition />} />
        <Route path="events"         element={<EventsList role="purchasing" />} />
        <Route path="events/:id"     element={<EventDetail role="purchasing" />} />
        <Route path="chat"           element={<AreaChat role="purchasing" />} />
        <Route path="notifications"  element={<Notifications />} />
        <Route path="me"             element={<RoleMe />} />
      </Route>
    </Routes>
  );
}
