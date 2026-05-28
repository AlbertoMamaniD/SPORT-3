import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CircleDollarSign,
  Trophy,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Tags,
  BarChart2,
} from 'lucide-react';
import type { DashboardStats, ReservaResponse } from '../../../../domain/model/types';
import {
  fetchDashboardStats,
  handleRegistrarPago,
  handleCancelarReservaAdmin,
} from './adminDashboard.service';
import { ReservasAdminTable } from './components/ReservasAdminTable';
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
  const [updatedMessage, setUpdatedMessage] = useState(false);

  const nombre = localStorage.getItem('nombre') ?? 'Admin Sport3';

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

  const handleRefresh = async () => {
    await loadData();
    setUpdatedMessage(true);
    setTimeout(() => setUpdatedMessage(false), 2200);
  };

  const handlePago = async (reservaId: number) => {
    await handleRegistrarPago(
      reservaId,
      (msg) => {
        triggerAlert('success', msg);
        loadData();
      },
      (msg) => triggerAlert('danger', msg),
    );
  };

  const handleConfirmCancelar = async () => {
    if (cancelTargetId === null) return;

    setSaving(true);

    await handleCancelarReservaAdmin(
      cancelTargetId,
      (msg) => {
        triggerAlert('success', msg);
        loadData();
      },
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
    <div className="admin-premium-layout">
      <aside className="admin-premium-sidebar">
        <div>
          <div className="admin-premium-brand" onClick={() => navigate('/admin')}>
            <span className="admin-premium-logo"></span>
            <h1>
              SPORT<span>3</span>
            </h1>
          </div>

          <nav className="admin-premium-nav">
            <button className="active" onClick={() => navigate('/admin')}>
              <ShieldCheck size={18} /> Panel Admin
            </button>

            <button onClick={() => navigate('/admin/canchas')}>
              <Trophy size={18} /> Canchas
            </button>

            <button onClick={() => navigate('/admin/precios')}>
              <CreditCard size={18} /> Precios
            </button>
          </nav>
        </div>

        <div className="admin-premium-user-card">
          <strong>{nombre}</strong>
          <small>Complejo deportivo premium</small>

          <button className="admin-premium-role-btn" onClick={handleLogout}>
            ADMIN
          </button>

          <button className="admin-premium-logout" onClick={handleLogout}>
            <LogOut size={16} /> Salir de la cuenta
          </button>

          {updatedMessage && (
            <div className="admin-premium-updated">
              <CheckCircle2 size={16} /> Vista actualizada
            </div>
          )}
        </div>
      </aside>

      <main className="admin-premium-main">
        <header className="admin-premium-topbar">
          <div>
            <div className="admin-premium-eyebrow">Panel de administración</div>
            <h2>Control total del complejo deportivo</h2>
            <p>
              Gestiona reservas, canchas, pagos y tarifas desde una interfaz visual,
              moderna y lista para vender el sistema.
            </p>
          </div>

          <button className="admin-premium-btn" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
          </button>
        </header>

        {alert && (
          <div className={`admin-premium-alert ${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.msg}</span>
          </div>
        )}

        <section className="admin-premium-hero">
          <div className="admin-premium-hero-card">
            <div>
              <h3>Hoy tienes 3 reservas pendientes de cobro</h3>
              <p>
                Prioriza pagos, revisa ocupación y mantén el flujo operativo sin perder
                información clave.
              </p>

              <div className="admin-premium-mini-grid">
                <div>
                  <strong>87%</strong>
                  <span>Ocupación tarde</span>
                </div>

                <div>
                  <strong>{loading ? '...' : stats?.canchasActivas ?? 6}</strong>
                  <span>Canchas activas</span>
                </div>

                <div>
                  <strong>Bs. 450</strong>
                  <span>Proyección diaria</span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-premium-court-card">
            <div className="admin-premium-court">
              <span></span>
            </div>
          </div>
        </section>

        <section className="admin-premium-kpis">
          <article>
            <div className="admin-premium-icon orange">
              <CalendarDays size={22} />
            </div>
            <label>Reservas hoy</label>
            <b>{loading ? '...' : stats?.totalReservasHoy ?? 0}</b>
            <small>4 más que ayer</small>
          </article>

          <article>
            <div className="admin-premium-icon green">
              <CircleDollarSign size={22} />
            </div>
            <label>Ingresos del día</label>
            <b>{loading ? '...' : `Bs. ${stats?.ingresosHoy ?? 0}`}</b>
            <small>Pagos registrados</small>
          </article>

          <article>
            <div className="admin-premium-icon blue">
              <Trophy size={22} />
            </div>
            <label>Canchas activas</label>
            <b>{loading ? '...' : stats?.canchasActivas ?? '—'}</b>
            <small>Fútbol y Wally</small>
          </article>

          <article>
            <div className="admin-premium-icon yellow">
              <CreditCard size={22} />
            </div>
            <label>Pendientes de pago</label>
            <b>{loading ? '...' : stats?.reservasPendientesPago ?? 0}</b>
            <small>Reservas sin cobro</small>
          </article>
        </section>

        <section className="admin-premium-section">
          <h3>Acciones rápidas</h3>

          <div className="admin-premium-quick">
            <button onClick={() => navigate('/admin/canchas')}>
              <div className="admin-premium-icon orange">
                <Trophy size={22} />
              </div>
              <div>
                <strong>Gestionar Canchas</strong>
                <span>Crear, editar o desactivar canchas del complejo</span>
              </div>
            </button>

            <button onClick={() => navigate('/admin/precios')}>
              <div className="admin-premium-icon blue">
                <Tags size={22} />
              </div>
              <div>
                <strong>Configurar Precios</strong>
                <span>Tarifas por horario, día de semana y feriados</span>
              </div>
            </button>

            <button onClick={() => navigate('/admin')}>
              <div className="admin-premium-icon green">
                <BarChart2 size={22} />
              </div>
              <div>
                <strong>Ver Estadísticas</strong>
                <span>Ocupación, pagos y rendimiento del complejo</span>
              </div>
            </button>
          </div>
        </section>

        <section className="admin-premium-section">
          <h3>Reservas recientes</h3>

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