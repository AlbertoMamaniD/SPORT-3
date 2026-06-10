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
import type { PrecioResponse, CanchaResponse, ConfigurarPrecioRequest } from '../../../../domain/model/types';
import { fetchPrecios, handleConfigurarPrecio, handleEliminarPrecio } from './gestionPrecios.service';
import { adminService } from '../../../../infrastructure/api/adminService';
import { PrecioTable } from './components/PrecioTable';
import { PrecioFormModal } from './components/PrecioFormModal';
import { ConfirmModal } from '../GestionCanchas/components/ConfirmModal';
import './GestionPrecios.css';

export const GestionPrecios: React.FC = () => {
  const navigate = useNavigate();
  const nombre = localStorage.getItem('nombre') ?? 'Admin Sport3';

  const [precios, setPrecios] = useState<PrecioResponse[]>([]);
  const [canchas, setCanchas] = useState<CanchaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [updatedMessage, setUpdatedMessage] = useState(false);

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

  const handleRefresh = async () => {
    await loadData();
    setUpdatedMessage(true);
    setTimeout(() => setUpdatedMessage(false), 2200);
  };

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
      (msg) => triggerAlert('danger', msg),
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
      (msg) => triggerAlert('danger', msg),
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

            <button onClick={() => navigate('/admin/canchas')}>
              <Trophy size={18} /> Canchas
            </button>

            <button className="active" onClick={() => navigate('/admin/precios')}>
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
            <div className="eyebrow">Gestión de precios</div>
            <h2>Configura tarifas especiales del complejo</h2>
            <p className="subtitle">
              Define precios por horario, día específico o feriado con el mismo estilo premium del panel principal.
            </p>
          </div>

          <div className="actions">
            <button className="btn" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
            </button>

            <button className="btn primary" onClick={handleOpenCreate}>
              <Plus size={16} /> Configurar Tarifa
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
            Tarifas totales: <b>{precios.length}</b>
          </span>

          <span className="chip orange">
            Feriados: <b>{precios.filter((p) => p.esFeriado).length}</b>
          </span>

          <span className="chip">
            Día específico: <b>{precios.filter((p) => p.diaSemana && !p.esFeriado).length}</b>
          </span>
        </section>

        <PrecioTable
          precios={precios}
          canchas={canchas}
          loading={loading}
          onDeletePrecio={(id) => setDeleteTargetId(id)}
        />
      </main>

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