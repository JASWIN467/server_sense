import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AdminLayout from './components/Layout/AdminLayout';
import DashboardHome from './pages/Admin/DashboardHome';

import ServerList from './pages/Admin/ServerList';
import Alerts from './pages/Admin/Alerts';
import AIDiagnostics from './pages/Admin/AIDiagnostics';
import Settings from './pages/Admin/Settings';
import UserList from './pages/Admin/UserList';

import UserLayout from './components/Layout/UserLayout';
import UserDashboard from './pages/User/UserDashboard';
import UserIntegrations from './pages/User/UserIntegrations';
import UserAlerts from './pages/User/UserAlerts';

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
          <Route path="ai-diagnostics" element={<AIDiagnostics />} />
          <Route path="users" element={<UserList />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="integrations" element={<UserIntegrations />} />
          <Route path="alerts" element={<UserAlerts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
