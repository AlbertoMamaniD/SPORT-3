import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShieldCheck, Trophy, CreditCard, LogOut, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import type { PrecioResponse, CanchaResponse, ConfigurarPrecioRequest } from '../../../../domain/model/types';
import { fetchPrecios, handleConfigurarPrecio, handleEliminarPrecio } from './gestionPrecios.service';
import { adminService } from '../../../../infrastructure/api/adminService';
import { PrecioTable } from './components/PrecioTable';
import { PrecioFormModal } from './components/PrecioFormModal';
import { ConfirmModal } from '../GestionCanchas/components/ConfirmModal';
import './GestionPrecios.css';

export const GestionPrecios: React.FC = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombre') ?? 'Administrador';

  const [precios, setPrecios] = useState<PrecioResponse[]>([]);
  const [canchas, setCanchas] = useState<CanchaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const triggerAlert = (type: 'success' | 'danger', msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [preciosData, canchasData] = await Promise.all([
        fetchPrecios(),
        adminService.listarTodasCanchas(),
      ]);
      setPrecios(preciosData);
      setCanchas(canchasData.filter((c) => c.activa));
    } catch {
      triggerAlert('danger', 'Error al cargar los datos de precios o canchas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    if (canchas.length === 0) {
      triggerAlert('danger', 'No hay canchas activas. Crea una cancha activa primero.');
      return;
    }
    setShowForm(true);
  };

  const handleSave = async (data: ConfigurarPrecioRequest): Promise<boolean> => {
    setSaving(true);
    const ok = await handleConfigurarPrecio(
      data,
      (msg) => triggerAlert('success', msg),
      (msg) => triggerAlert('danger', msg)
    );
    setSaving(false);
    if (ok) loadData();
    return ok;
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    setSaving(true);
    const ok = await handleEliminarPrecio(
      deleteTargetId,
      (msg) => triggerAlert('success', msg),
      (msg) => triggerAlert('danger', msg)
    );
    setSaving(false);
    setDeleteTargetId(null);
    if (ok) loadData();
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
          <button className="sidebar-link" onClick={() => navigate('/admin')}>
            <ShieldCheck size={18} /> Panel Admin
          </button>
          <button className="sidebar-link" onClick={() => navigate('/admin/canchas')}>
            <Trophy size={18} /> Canchas
          </button>
          <button className="sidebar-link active" onClick={() => navigate('/admin/precios')}>
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
            <h1 className="admin-page-title">Gestión de Precios</h1>
            <p className="admin-page-subtitle">Configura tarifas personalizadas según horarios, días o feriados</p>
          </div>
          <div className="topbar-actions">
            <button id="btn-refresh-precios" className="btn-admin-refresh" onClick={loadData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
            </button>
            <button id="btn-nuevo-precio" className="btn-admin-primary" onClick={handleOpenCreate}>
              <Plus size={16} /> Configurar Tarifa
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
          <div className="precios-summary">
            <span className="summary-chip chip-total">
              💵 Tarifas Totales: {precios.length}
            </span>
            <span className="summary-chip chip-feriado">
              🎉 Feriados: {precios.filter((p) => p.esFeriado).length}
            </span>
            <span className="summary-chip chip-semana">
              📅 Días Específicos: {precios.filter((p) => p.diaSemana && !p.esFeriado).length}
            </span>
          </div>

          <PrecioTable
            precios={precios}
            canchas={canchas}
            loading={loading}
            onDeletePrecio={(id) => setDeleteTargetId(id)}
          />
        </section>
      </main>

      {/* ── Modales ── */}
      {showForm && (
        <PrecioFormModal
          canchas={canchas}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          loading={saving}
        />
      )}

      {deleteTargetId !== null && (
        <ConfirmModal
          title="Eliminar Tarifa"
          message="¿Estás seguro de eliminar esta configuración de precio? Las nuevas reservas en esta franja volverán al precio base."
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
          loading={saving}
          danger
        />
      )}
    </div>
  );
};
