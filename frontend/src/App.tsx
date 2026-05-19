import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './ui/pages/Login/Login';
import { Register } from './ui/pages/Register/Register';
import { Dashboard } from './ui/pages/Dashboard/Dashboard';

interface RouteProps {
  children: React.ReactNode;
}

// Guard para rutas privadas (requieren login activo)
const PrivateRoute: React.FC<RouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guard para rutas públicas (ej. login/registro no accesibles si ya se inició sesión)
const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
        <Routes>
          {/* Ruta base: Redirige según si tiene token de sesión */}
          <Route path="/" element={
            localStorage.getItem('token') ? (
              <Navigate to="/dashboard" replace />
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

          {/* Rutas Privadas */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Redirección por defecto ante rutas desconocidas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
