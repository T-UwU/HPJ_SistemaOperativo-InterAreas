// src/roles/maintenance/index.jsx — Layout del rol Mantenimiento.

import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';

import MaintenanceTickets      from './Tickets.jsx';
import MaintenanceDetail       from './Detail.jsx';
import MaintenanceNewTicket    from './NewTicket.jsx';
import MaintenanceHistory      from './History.jsx';
import MaintenanceRequisitions from './Requisitions.jsx';
import RoleMe                  from '../../ui/RoleMe.jsx';
import AreaChat                from '../../ui/AreaChat.jsx';
import Notifications           from '../../ui/Notifications.jsx';
import { EventsList, EventDetail } from '../../ui/EventsCalendar.jsx';
import { useActivityUnread }   from '../../store/activity.js';
import { useCurrentUser }      from '../../store/auth.js';

function MaintenanceShell() {
  const { pathname } = useLocation();
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);

  const hideTabs =
    pathname.includes('/ticket/')       ||
    pathname.includes('/new-ticket')    ||
    pathname.includes('/chat')          ||
    pathname.includes('/notifications') ||
    pathname.includes('/events/');

  const tabs = [
    { id: 'open',  label: 'Abiertos', icon: I.wrench, to: '/maintenance' },
    { id: 'reqs',  label: 'Pedidos',  icon: I.pkg,    to: '/maintenance/requisitions' },
    { id: 'events',label: 'Eventos',  icon: I.cal,    to: '/maintenance/events' },
    { id: 'chat',  label: 'Chat',     icon: I.msg,    to: '/maintenance/chat' },
    { id: 'me',    label: 'Yo',       icon: I.user,   to: '/maintenance/me',
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

export default function MaintenanceRoutes() {
  return (
    <Routes>
      <Route element={<MaintenanceShell />}>
        <Route index                  element={<MaintenanceTickets />} />
        <Route path="ticket/:id"      element={<MaintenanceDetail />} />
        <Route path="new-ticket"      element={<MaintenanceNewTicket />} />
        <Route path="history"         element={<MaintenanceHistory />} />
        <Route path="requisitions"    element={<MaintenanceRequisitions />} />
        <Route path="events"          element={<EventsList role="maintenance" />} />
        <Route path="events/:id"      element={<EventDetail role="maintenance" />} />
        <Route path="chat"            element={<AreaChat role="maintenance" />} />
        <Route path="notifications"   element={<Notifications />} />
        <Route path="me"              element={<RoleMe />} />
      </Route>
    </Routes>
  );
}
