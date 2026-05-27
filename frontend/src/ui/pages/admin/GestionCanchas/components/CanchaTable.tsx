import React from 'react';
import { Trophy, Edit2, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import type { CanchaResponse } from '../../../../../domain/model/types';

interface CanchaTableProps {
  canchas: CanchaResponse[];
  loading: boolean;
  onEditar: (cancha: CanchaResponse) => void;
  onDesactivar: (cancha: CanchaResponse) => void;
}

export const CanchaTable: React.FC<CanchaTableProps> = ({
  canchas,
  loading,
  onEditar,
  onDesactivar,
}) => {
  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="loader-spinner" />
        <p>Cargando canchas...</p>
      </div>
    );
  }

  if (canchas.length === 0) {
    return (
      <div className="admin-table-empty">
        <Trophy size={40} />
        <p>No hay canchas registradas en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {canchas.map((c) => (
            <tr key={c.id} className="admin-table-row">
              <td className="td-id">#{c.id}</td>
              <td className="td-main">{c.nombre}</td>
              <td>
                <span className="td-sub">
                  {c.tipo === 'FUTBOL' ? '⚽ Fútbol' : '🏐 Wally'}
                </span>
              </td>
              <td>
                <span className="td-sub">{c.capacidad} Jugadores</span>
              </td>
              <td>
                {c.activa ? (
                  <span className="reserva-badge badge-confirmada">Activa</span>
                ) : (
                  <span className="reserva-badge badge-cancelada">Inactiva</span>
                )}
              </td>
              <td>
                <div className="admin-table-actions" style={{ justifyContent: 'center' }}>
                  <button
                    className="btn-action-pago"
                    style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}
                    onClick={() => onEditar(c)}
                    title="Editar cancha"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  {c.activa && (
                    <button
                      className="btn-action-cancel-admin"
                      onClick={() => onDesactivar(c)}
                      title="Desactivar cancha"
                    >
                      <EyeOff size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
