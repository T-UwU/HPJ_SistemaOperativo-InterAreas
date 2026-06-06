// src/roles/reception/index.jsx — Layout del rol Recepción.

import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';

import ReceptionHome from './Home.jsx';
import RoleMe        from '../../ui/RoleMe.jsx';
import AreaChat      from '../../ui/AreaChat.jsx';
import Notifications from '../../ui/Notifications.jsx';
import { EventsList, EventDetail } from '../../ui/EventsCalendar.jsx';
import { useActivityUnread } from '../../store/activity.js';
import { useCurrentUser }    from '../../store/auth.js';

function ReceptionShell() {
  const { pathname } = useLocation();
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);

  const hideTabs =
    pathname.includes('/chat')          ||
    pathname.includes('/notifications') ||
    pathname.includes('/events/');

  const tabs = [
    { id: 'home',   label: 'Inicio',   icon: I.home, to: '/reception' },
    { id: 'events', label: 'Eventos',  icon: I.cal,  to: '/reception/events' },
    { id: 'chat',   label: 'Chat',     icon: I.msg,  to: '/reception/chat' },
    { id: 'me',     label: 'Yo',       icon: I.user, to: '/reception/me',
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

export default function ReceptionRoutes() {
  return (
    <Routes>
      <Route element={<ReceptionShell />}>
        <Route index               element={<ReceptionHome />} />
        <Route path="events"       element={<EventsList role="reception" />} />
        <Route path="events/:id"   element={<EventDetail role="reception" />} />
        <Route path="chat"         element={<AreaChat role="reception" />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="me"           element={<RoleMe />} />
      </Route>
    </Routes>
  );
}
