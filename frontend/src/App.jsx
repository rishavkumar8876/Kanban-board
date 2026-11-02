import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { connectSocket } from './services/socket';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoardPage from './pages/KanbanBoardPage';
import OrganizationManagement from './pages/OrganizationManagement';
import TenantManagement from './pages/TenantManagement';
import TenantMembers from './pages/TenantMembers';
import ActivityLogs from './pages/ActivityLogs';
import UserProfile from './pages/UserProfile';

export const App = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
      connectSocket(token);
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/board" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/board" replace /> : <Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/board" element={<KanbanBoardPage />} />
          <Route path="/organizations" element={<OrganizationManagement />} />
          <Route path="/tenants" element={<TenantManagement />} />
          <Route path="/members" element={<TenantMembers />} />
          <Route path="/activities" element={<ActivityLogs />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
