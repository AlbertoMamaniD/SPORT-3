import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ShieldCheck,
  Trophy,
  CreditCard,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { CanchaResponse, CanchaRequest } from '../../../../domain/model/types';
import {
  fetchCanchas,
  handleCrearCancha,
  handleEditarCancha,
  handleDesactivarCancha,
} from './gestionCanchas.service';
import { CanchaTable } from './components/CanchaTable';
import { CanchaFormModal } from './components/CanchaFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import './GestionCanchas.css';

export const GestionCanchas: React.FC = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombre') ?? 'Admin Sport3';

  const [canchas, setCanchas] = useState<CanchaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editCancha, setEditCancha] = useState<CanchaResponse | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CanchaResponse | null>(null);
  const [updatedMessage, setUpdatedMessage] = useState(false);

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

  useEffect(() => {
    loadCanchas();
  }, [loadCanchas]);

  const handleRefresh = async () => {
    await loadCanchas();
    setUpdatedMessage(true);
    setTimeout(() => setUpdatedMessage(false), 2200);
  };

  const handleOpenCreate = () => {
    setEditCancha(null);
    setShowForm(true);
  };

  const handleOpenEdit = (c: CanchaResponse) => {
    setEditCancha(c);
    setShowForm(true);
  };

  const handleSave = async (data: CanchaRequest): Promise<boolean> => {
    setSaving(true);

    const ok = editCancha
      ? await handleEditarCancha(
        editCancha.id,
        data,
        (msg) => triggerAlert('success', msg),
        (msg) => triggerAlert('danger', msg),
      )
      : await handleCrearCancha(
        data,
        (msg) => triggerAlert('success', msg),
        (msg) => triggerAlert('danger', msg),
      );

    setSaving(false);

    if (ok) loadCanchas();

    return ok;
  };

  const handleConfirmDesactivar = async () => {
    if (!confirmTarget) return;

    setSaving(true);

    const ok = await handleDesactivarCancha(
      confirmTarget.id,
      confirmTarget.nombre,
      (msg) => triggerAlert('success', msg),
      (msg) => triggerAlert('danger', msg),
    );

    setSaving(false);
    setConfirmTarget(null);

    if (ok) loadCanchas();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <div className="brand" onClick={() => navigate('/admin')}>
            <div className="logo"></div>
            <h1>
              SPORT<span>3</span>
            </h1>
          </div>

          <nav className="nav">
            <button onClick={() => navigate('/admin')}>
              <ShieldCheck size={18} /> Panel Admin
            </button>

            <button className="active" onClick={() => navigate('/admin/canchas')}>
              <Trophy size={18} /> Canchas
            </button>

            <button onClick={() => navigate('/admin/precios')}>
              <CreditCard size={18} /> Precios
            </button>
          </nav>
        </div>

        <div className="admin-card">
          <strong>{nombre}</strong>
          <small>Complejo deportivo premium</small>

          <button className="badge" onClick={handleLogout}>
            ADMIN
          </button>

          <div className="admin-actions">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Salir de la cuenta
            </button>

            {updatedMessage && (
              <div className="update-indicator show">
                <CheckCircle2 size={16} /> Vista actualizada
              </div>
            )}
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <div className="eyebrow">Gestión de canchas</div>
            <h2>Administra las canchas del complejo deportivo</h2>
            <p className="subtitle">
              Crea, edita o desactiva canchas del complejo con el mismo estilo premium del panel principal.
            </p>
          </div>

          <div className="actions">
            <button className="btn" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
            </button>

            <button className="btn primary" onClick={handleOpenCreate}>
              <Plus size={16} /> Nueva Cancha
            </button>
          </div>
        </header>

        {alert && (
          <div className={`admin-alert alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.msg}</span>
          </div>
        )}

        <section className="filters">
          <span className="chip green">
            Activas: <b>{canchas.filter((c) => c.activa).length}</b>
          </span>

          <span className="chip">
            Inactivas: <b>{canchas.filter((c) => !c.activa).length}</b>
          </span>

          <span className="chip orange">
            Fútbol: <b>{canchas.filter((c) => c.tipo === 'FUTBOL').length}</b>
          </span>

          <span className="chip">
            Wally: <b>{canchas.filter((c) => c.tipo === 'WALLY').length}</b>
          </span>
        </section>

        <CanchaTable
          canchas={canchas}
          loading={loading}
          onEditar={handleOpenEdit}
          onDesactivar={(c) => setConfirmTarget(c)}
        />
      </main>

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