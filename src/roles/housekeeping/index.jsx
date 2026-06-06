// src/roles/housekeeping/index.jsx — Layout del rol Limpieza.

import React from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../../ui/shared.jsx';
import { I } from '../../ui/icons.jsx';

import HousekeepingTasks    from './Tasks.jsx';
import HousekeepingDetail   from './Detail.jsx';
import HousekeepingReport   from './Report.jsx';
import HousekeepingNewTask  from './NewTask.jsx';
import HousekeepingEvidence from './Evidence.jsx';
import RoleMe               from '../../ui/RoleMe.jsx';
import AreaChat           from '../../ui/AreaChat.jsx';
import Notifications      from '../../ui/Notifications.jsx';
import { EventsList, EventDetail } from '../../ui/EventsCalendar.jsx';
import { useActivityUnread } from '../../store/activity.js';
import { useCurrentUser } from '../../store/auth.js';

function HousekeepingShell() {
  const { pathname } = useLocation();
  const user      = useCurrentUser();
  const actUnread = useActivityUnread(user?.roleId);

  const hideTabs =
    pathname.includes('/task/')         ||
    pathname.includes('/report')        ||
    pathname.includes('/new-task')      ||
    pathname.includes('/evidence/')     ||
    pathname.includes('/chat')          ||
    pathname.includes('/notifications') ||
    pathname.includes('/events/');

  const tabs = [
    { id: 'tasks',  label: 'Tareas',  icon: I.list,  to: '/housekeeping' },
    { id: 'events', label: 'Eventos', icon: I.cal,   to: '/housekeeping/events' },
    { id: 'chat',   label: 'Chat',    icon: I.msg,   to: '/housekeeping/chat' },
    { id: 'me',     label: 'Yo',      icon: I.user,  to: '/housekeeping/me',
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

export default function HousekeepingRoutes() {
  return (
    <Routes>
      <Route element={<HousekeepingShell />}>
        <Route index                 element={<HousekeepingTasks />} />
        <Route path="task/:id"       element={<HousekeepingDetail />} />
        <Route path="report"         element={<HousekeepingReport />} />
        <Route path="new-task"       element={<HousekeepingNewTask />} />
        <Route path="evidence/:id"   element={<HousekeepingEvidence />} />
        <Route path="events"         element={<EventsList role="housekeeping" />} />
        <Route path="events/:id"     element={<EventDetail role="housekeeping" />} />
        <Route path="chat"           element={<AreaChat role="housekeeping" />} />
        <Route path="notifications"  element={<Notifications />} />
        <Route path="me"             element={<RoleMe />} />
      </Route>
    </Routes>
  );
}
