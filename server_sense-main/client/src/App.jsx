import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AdminLayout from './components/Layout/AdminLayout';
import DashboardHome from './pages/Admin/DashboardHome';

import ServerList from './pages/Admin/ServerList';
import Alerts from './pages/Admin/Alerts';
import Settings from './pages/Admin/Settings';
import UserList from './pages/Admin/UserList';
import MetricsDashboard from './pages/Admin/MetricsDashboard';

import UserLayout from './components/Layout/UserLayout';
import UserDashboard from './pages/User/UserDashboard';
import UserServerList from './pages/User/UserServerList';
import UserAlerts from './pages/User/UserAlerts';
import ServerDetail from './pages/User/ServerDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        {/* Placeholder routes for future implementation */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="servers" element={<ServerList />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="users" element={<UserList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="metrics" element={<MetricsDashboard />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="servers" element={<UserServerList />} />
          <Route path="server/:id" element={<ServerDetail />} />
          <Route path="alerts" element={<UserAlerts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
