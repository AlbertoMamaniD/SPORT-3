import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, CircleDollarSign, Trophy, CreditCard,
  CheckCircle2, AlertCircle, RefreshCw, LogOut, ShieldCheck,
} from 'lucide-react';
import type { DashboardStats, ReservaResponse } from '../../../../domain/model/types';
import {
  fetchDashboardStats,
  handleRegistrarPago,
  handleCancelarReservaAdmin,
} from './adminDashboard.service';
import { StatsCard } from './components/StatsCard';
import { ReservasAdminTable } from './components/ReservasAdminTable';
import { QuickActions } from './components/QuickActions';
import { ConfirmModal } from '../GestionCanchas/components/ConfirmModal';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);

  const nombre = localStorage.getItem('nombre') ?? 'Administrador';

  const triggerAlert = (type: 'success' | 'danger', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
      setReservas(data.reservasRecientes || []);
    } catch {
      triggerAlert('danger', 'Error al cargar el panel de administración.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePago = async (reservaId: number) => {
    await handleRegistrarPago(
      reservaId,
      (msg) => { triggerAlert('success', msg); loadData(); },
      (msg) => triggerAlert('danger', msg),
    );
  };

  const handleConfirmCancelar = async () => {
    if (cancelTargetId === null) return;
    setSaving(true);
    await handleCancelarReservaAdmin(
      cancelTargetId,
      (msg) => { triggerAlert('success', msg); loadData(); },
      (msg) => triggerAlert('danger', msg),
    );
    setSaving(false);
    setCancelTargetId(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/admin')}>
          <span className="sidebar-ball">⚽</span>
          <span className="sidebar-name">SPORT<span className="sidebar-highlight">3</span></span>
        </div>

        <nav className="sidebar-nav">
          <button id="sb-dashboard" className="sidebar-link active" onClick={() => navigate('/admin')}>
            <ShieldCheck size={18} /> Panel Admin
          </button>
          <button id="sb-canchas" className="sidebar-link" onClick={() => navigate('/admin/canchas')}>
            <Trophy size={18} /> Canchas
          </button>
          <button id="sb-precios" className="sidebar-link" onClick={() => navigate('/admin/precios')}>
            <CreditCard size={18} /> Precios
          </button>
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-user-name">{nombre}</p>
          <span className="sidebar-role-badge">ADMIN</span>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={15} /> Salir
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Panel de Administración</h1>
            <p className="admin-page-subtitle">Visión general del complejo deportivo</p>
          </div>
          <button id="btn-refresh-dashboard" className="btn-admin-refresh" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`admin-alert alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.msg}</span>
          </div>
        )}

        {/* Stats cards */}
        <section className="admin-stats-grid">
          <StatsCard
            title="Reservas hoy"
            value={loading ? '...' : (stats?.totalReservasHoy ?? 0)}
            icon={<CalendarDays size={26} />}
            accent="orange"
          />
          <StatsCard
            title="Ingresos del día"
            value={loading ? '...' : `${stats?.ingresosHoy ?? 0} Bs.`}
            icon={<CircleDollarSign size={26} />}
            accent="green"
          />
          <StatsCard
            title="Canchas activas"
            value={loading ? '...' : (stats?.canchasActivas ?? '—')}
            icon={<Trophy size={26} />}
            accent="blue"
          />
          <StatsCard
            title="Pendientes de pago"
            value={loading ? '...' : (stats?.reservasPendientesPago ?? 0)}
            subtitle="Reservas sin cobro registrado"
            icon={<CreditCard size={26} />}
            accent="yellow"
          />
        </section>

        {/* Quick actions */}
        <section className="admin-section">
          <h2 className="admin-section-title">Acciones Rápidas</h2>
          <QuickActions />
        </section>

        {/* Reservas recientes */}
        <section className="admin-section">
          <h2 className="admin-section-title">Reservas Recientes</h2>
          <ReservasAdminTable
            reservas={reservas}
            loading={loading}
            onRegistrarPago={handlePago}
            onCancelar={setCancelTargetId}
          />
        </section>
      </main>

      {cancelTargetId !== null && (
        <ConfirmModal
          title="Cancelar Reserva"
          message="¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer y el horario quedará libre para otros usuarios."
          confirmLabel="Cancelar Reserva"
          onConfirm={handleConfirmCancelar}
          onCancel={() => setCancelTargetId(null)}
          loading={saving}
          danger
        />
      )}
    </div>
  );
};
