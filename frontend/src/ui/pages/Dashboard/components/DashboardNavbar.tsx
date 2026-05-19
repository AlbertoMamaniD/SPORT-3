import React from 'react';
import { LogOut, Menu, X, User } from 'lucide-react';
import './DashboardNavbar.css';

interface UserSession {
  nombre: string;
  telefono: string;
  rol: string;
}

interface DashboardNavbarProps {
  user: UserSession;
  currentTab: 'HOME' | 'CANCHAS' | 'RESERVAS';
  setCurrentTab: (tab: 'HOME' | 'CANCHAS' | 'RESERVAS') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  handleLogoutClick: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  user,
  currentTab,
  setCurrentTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogoutClick
}) => {
  return (
    <header className="dashboard-navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => setCurrentTab('HOME')}>
          <span className="logo-soccer-symbol">⚽</span>
          <span className="logo-text">SPORT<span className="logo-highlight">3</span></span>
        </div>

        {/* Menú Desktop */}
        <nav className="navbar-links-desktop">
          <button 
            className={`nav-item-btn ${currentTab === 'HOME' ? 'active' : ''}`}
            onClick={() => setCurrentTab('HOME')}
          >
            Inicio
          </button>
          <button 
            className={`nav-item-btn ${currentTab === 'CANCHAS' ? 'active' : ''}`}
            onClick={() => setCurrentTab('CANCHAS')}
          >
            Reservar Cancha
          </button>
          <button 
            className={`nav-item-btn ${currentTab === 'RESERVAS' ? 'active' : ''}`}
            onClick={() => setCurrentTab('RESERVAS')}
          >
            Mis Reservas
          </button>
        </nav>

        {/* Perfil & Logout */}
        <div className="navbar-profile-desktop">
          <div className="profile-badge-info">
            <User size={14} />
            <span>{user.nombre}</span>
            <span className="badge-role">{user.rol}</span>
          </div>
          <button className="navbar-logout-btn" onClick={handleLogoutClick} title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>

        {/* Botón menú móvil */}
        <button className="navbar-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Cajón móvil */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <button 
            className={`mobile-nav-btn ${currentTab === 'HOME' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('HOME'); setMobileMenuOpen(false); }}
          >
            Inicio
          </button>
          <button 
            className={`mobile-nav-btn ${currentTab === 'CANCHAS' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('CANCHAS'); setMobileMenuOpen(false); }}
          >
            Reservar Cancha
          </button>
          <button 
            className={`mobile-nav-btn ${currentTab === 'RESERVAS' ? 'active' : ''}`}
            onClick={() => { setCurrentTab('RESERVAS'); setMobileMenuOpen(false); }}
          >
            Mis Reservas
          </button>
          <div className="mobile-profile-section">
            <p className="mobile-profile-name">{user.nombre} ({user.rol})</p>
            <button className="mobile-logout-btn" onClick={handleLogoutClick}>
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
