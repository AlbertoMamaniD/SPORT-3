import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck, Trophy, CreditCard, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import type { CanchaResponse, CanchaRequest } from '../../../../domain/model/types';
import { fetchCanchas, handleCrearCancha, handleEditarCancha, handleDesactivarCancha } from './gestionCanchas.service';
import { CanchaTable } from './components/CanchaTable';
import { CanchaFormModal } from './components/CanchaFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import './GestionCanchas.css';

export const GestionCanchas: React.FC = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombre') ?? 'Administrador';

  const [canchas, setCanchas] = useState<CanchaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editCancha, setEditCancha] = useState<CanchaResponse | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CanchaResponse | null>(null);

  const triggerAlert = (type: 'success' | 'danger', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadCanchas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCanchas();
      setCanchas(data);
    } catch {
      triggerAlert('danger', 'Error al cargar las canchas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCanchas(); }, [loadCanchas]);

  const handleOpenCreate = () => { setEditCancha(null); setShowForm(true); };
  const handleOpenEdit = (c: CanchaResponse) => { setEditCancha(c); setShowForm(true); };

  const handleSave = async (data: CanchaRequest): Promise<boolean> => {
    setSaving(true);
    let ok: boolean;
    if (editCancha) {
      ok = await handleEditarCancha(editCancha.id, data,
        (msg) => triggerAlert('success', msg),
        (msg) => triggerAlert('danger', msg),
      );
    } else {
      ok = await handleCrearCancha(data,
        (msg) => triggerAlert('success', msg),
        (msg) => triggerAlert('danger', msg),
      );
    }
    setSaving(false);
    if (ok) loadCanchas();
    return ok;
  };

  const handleConfirmDesactivar = async () => {
    if (!confirmTarget) return;
    setSaving(true);
    const ok = await handleDesactivarCancha(
      confirmTarget.id, confirmTarget.nombre,
      (msg) => triggerAlert('success', msg),
      (msg) => triggerAlert('danger', msg),
    );
    setSaving(false);
    setConfirmTarget(null);
    if (ok) loadCanchas();
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/admin')}>
          <span className="sidebar-ball">⚽</span>
          <span className="sidebar-name">SPORT<span className="sidebar-highlight">3</span></span>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => navigate('/admin')}>
            <ShieldCheck size={18} /> Panel Admin
          </button>
          <button className="sidebar-link active" onClick={() => navigate('/admin/canchas')}>
            <Trophy size={18} /> Canchas
          </button>
          <button className="sidebar-link" onClick={() => navigate('/admin/precios')}>
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

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Gestión de Canchas</h1>
            <p className="admin-page-subtitle">Administra las canchas del complejo deportivo</p>
          </div>
          <div className="topbar-actions">
            <button id="btn-refresh-canchas" className="btn-admin-refresh" onClick={loadCanchas} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
            </button>
            <button id="btn-nueva-cancha" className="btn-admin-primary" onClick={handleOpenCreate}>
              <Plus size={16} /> Nueva Cancha
            </button>
          </div>
        </div>

        {alert && (
          <div className={`admin-alert alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.msg}</span>
          </div>
        )}

        <section className="admin-section">
          <div className="canchas-summary">
            <span className="summary-chip chip-active">
              ✓ Activas: {canchas.filter(c => c.activa).length}
            </span>
            <span className="summary-chip chip-inactive">
              ✗ Inactivas: {canchas.filter(c => !c.activa).length}
            </span>
            <span className="summary-chip chip-futbol">
              ⚽ Fútbol: {canchas.filter(c => c.tipo === 'FUTBOL').length}
            </span>
            <span className="summary-chip chip-wally">
              🏐 Wally: {canchas.filter(c => c.tipo === 'WALLY').length}
            </span>
          </div>

          <CanchaTable
            canchas={canchas}
            loading={loading}
            onEditar={handleOpenEdit}
            onDesactivar={(c) => setConfirmTarget(c)}
          />
        </section>
      </main>

      {/* ── Modales ── */}
      {showForm && (
        <CanchaFormModal
          cancha={editCancha}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {confirmTarget && (
        <ConfirmModal
          title="Desactivar Cancha"
          message={`¿Estás seguro de desactivar "${confirmTarget.nombre}"? Los usuarios no podrán reservarla.`}
          confirmLabel="Desactivar"
          onConfirm={handleConfirmDesactivar}
          onCancel={() => setConfirmTarget(null)}
          loading={saving}
          danger
        />
      )}
    </div>
  );
};
