import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './ui/pages/Login/Login';
import { Register } from './ui/pages/Register/Register';
import { Dashboard } from './ui/pages/Dashboard/Dashboard';
import { AdminDashboard } from './ui/pages/admin/AdminDashboard/AdminDashboard';
import { GestionCanchas } from './ui/pages/admin/GestionCanchas/GestionCanchas';
import { GestionPrecios } from './ui/pages/admin/GestionPrecios/GestionPrecios';

interface RouteProps {
  children: React.ReactNode;
}

// Guard para rutas privadas generales (requieren login activo)
const PrivateRoute: React.FC<RouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guard para rutas de administrador (requieren token y rol de ADMIN)
const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return rol === 'ADMIN' ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Guard para rutas públicas (login/registro no accesibles si ya se inició sesión)
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  
  if (token) {
    return rol === 'ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
        <Routes>
          {/* Ruta base: Redirige según si tiene token de sesión y su rol correspondiente */}
          <Route path="/" element={
            localStorage.getItem('token') ? (
              localStorage.getItem('rol') === 'ADMIN' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Rutas Públicas */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Rutas de Usuario General */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Rutas de Administrador */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/admin/canchas" element={
            <AdminRoute>
              <GestionCanchas />
            </AdminRoute>
          } />

          <Route path="/admin/precios" element={
            <AdminRoute>
              <GestionPrecios />
            </AdminRoute>
          } />

          {/* Redirección por defecto ante rutas desconocidas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
