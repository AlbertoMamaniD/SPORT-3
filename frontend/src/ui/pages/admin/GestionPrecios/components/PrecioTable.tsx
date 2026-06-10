import React from 'react';
import { CreditCard, Trash2, Clock } from 'lucide-react';
import type { PrecioResponse, CanchaResponse } from '../../../../../domain/model/types';

interface PrecioTableProps {
  precios: PrecioResponse[];
  canchas: CanchaResponse[];
  loading: boolean;
  onDeletePrecio: (id: number) => void;
}

const fmtTime = (time: string) => time?.substring(0, 5) ?? '';

export const PrecioTable: React.FC<PrecioTableProps> = ({
  precios,
  canchas,
  loading,
  onDeletePrecio,
}) => {
  const getCanchaName = (canchaId: number) => {
    const cancha = canchas.find((c) => c.id === canchaId);
    return cancha ? cancha.nombre : `Cancha #${canchaId}`;
  };

  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="loader-spinner" />
        <p>Cargando configuraciones de precios...</p>
      </div>
    );
  }

  if (precios.length === 0) {
    return (
      <div className="admin-table-empty">
        <CreditCard size={40} />
        <p>No hay tarifas especiales configuradas. Se aplicará el precio base.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cancha</th>
            <th>Horario</th>
            <th>Condición / Día</th>
            <th>Tarifa Especial</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {precios.map((p) => (
            <tr key={p.id} className="admin-table-row">
              <td className="td-id">#{p.id}</td>
              <td className="td-main">{getCanchaName(p.canchaId)}</td>
              <td>
                <span className="td-icon-row">
                  <Clock size={13} /> {fmtTime(p.horaInicio)} – {fmtTime(p.horaFin)}
                </span>
              </td>
              <td>
                {p.esFeriado ? (
                  <span className="reserva-badge badge-pendiente">🎉 Feriado</span>
                ) : p.diaSemana ? (
                  <span className="reserva-badge badge-confirmada" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    📅 {p.diaSemana}
                  </span>
                ) : (
                  <span className="reserva-badge badge-cancelada">Base Diario</span>
                )}
              </td>
              <td>
                <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>
                  {p.precioHora} Bs / Hora
                </strong>
              </td>
              <td>
                <div className="admin-table-actions" style={{ justifyContent: 'center' }}>
                  <button
                    className="btn-action-cancel-admin"
                    onClick={() => onDeletePrecio(p.id)}
                    title="Eliminar tarifa especial"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
