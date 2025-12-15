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
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/user/*" element={<div className="text-white text-center mt-20">User Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
