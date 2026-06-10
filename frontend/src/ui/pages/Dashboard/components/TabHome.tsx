import React from 'react';
import { Calendar, Activity, ShieldCheck, MapPin, CircleDollarSign } from 'lucide-react';
import './TabHome.css';

interface UserSession {
  nombre: string;
  telefono: string;
  rol: string;
}

interface TabHomeProps {
  user: UserSession;
  setCurrentTab: (tab: 'HOME' | 'CANCHAS' | 'RESERVAS') => void;
}

export const TabHome: React.FC<TabHomeProps> = ({ user, setCurrentTab }) => {
  return (
    <div className="tab-home-container">
      <div className="welcome-banner">
        <div className="banner-left">
          <h1>¡Bienvenido a SPORT 3, {user.nombre}!</h1>
          <p>Tu plataforma digital premium para reservar y gestionar canchas de fútbol y wally al instante.</p>
          <div className="banner-buttons">
            <button className="btn-primary-action" onClick={() => setCurrentTab('CANCHAS')}>
              <Calendar size={18} /> Reservar Ahora
            </button>
            <button className="btn-secondary-action" onClick={() => setCurrentTab('RESERVAS')}>
              <Activity size={18} /> Ver Mis Reservas
            </button>
          </div>
        </div>
        <div className="banner-right-badge">
          <ShieldCheck size={72} className="shield-glow" />
          <p>Cuenta Verificada</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Estado del Sistema</h3>
            <p className="stat-value">Activo</p>
            <p className="stat-desc">Servidor online sin demoras</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <h3>Complejo SPORT 3</h3>
            <p className="stat-value">6 Canchas</p>
            <p className="stat-desc">Fútbol Sintético y Wally</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CircleDollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Precios de Locura</h3>
            <p className="stat-value">Desde 50 Bs.</p>
            <p className="stat-desc">Tarifa fija por hora de juego</p>
          </div>
        </div>
      </div>

      {/* Perfil info detallada */}
      <div className="profile-details-card">
        <h2>Detalles de tu cuenta</h2>
        <div className="profile-grid">
          <div className="profile-field">
            <span className="field-label">Nombre Completo:</span>
            <span className="field-val">{user.nombre}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Celular / Teléfono:</span>
            <span className="field-val">{user.telefono}</span>
          </div>
          <div className="profile-field">
            <span className="field-label">Rol en el Sistema:</span>
            <span className={`badge-role-pill ${user.rol === 'ADMIN' ? 'admin' : 'user'}`}>
              {user.rol}
            </span>
          </div>
          <div className="profile-field">
            <span className="field-label">Soporte Técnico:</span>
            <span className="field-val highlight">Activo (+591 OTP Auth)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
