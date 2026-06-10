import React from 'react';
import { Calendar, Clock, CircleDollarSign, CheckCircle2, XCircle, Banknote } from 'lucide-react';
import type { ReservaResponse } from '../../../../../domain/model/types';
import { formatDateBO } from '../../../../../utils/dateUtils';

interface ReservasAdminTableProps {
  reservas: ReservaResponse[];
  loading: boolean;
  onRegistrarPago: (reservaId: number) => void;
  onCancelar: (reservaId: number) => void;
  onVerComprobante: (reserva: ReservaResponse) => void;
}

const estadoBadge = (estado: string) => {
  const map: Record<string, string> = {
    PENDIENTE: 'badge-pendiente',
    CONFIRMADA: 'badge-confirmada',
    CANCELADA: 'badge-cancelada',
  };
  return <span className={`reserva-badge ${map[estado] ?? ''}`}>{estado}</span>;
};

const pagoBadge = (estadoPago?: string) => {
  if (!estadoPago) return null;
  const map: Record<string, string> = {
    PENDIENTE:   'pago-pendiente',
    COMPLETADO:  'pago-completado',
    RECHAZADO:   'pago-rechazado',
    REEMBOLSADO: 'pago-reembolsado',
  };
  return <span className={`pago-badge ${map[estadoPago] ?? ''}`}>{estadoPago}</span>;
};

const fmt = (hora: string) => hora?.substring(0, 5) ?? '';

export const ReservasAdminTable: React.FC<ReservasAdminTableProps> = ({
  reservas,
  loading,
  onRegistrarPago,
  onCancelar,
  onVerComprobante,
}) => {
  if (loading) {
    return (
      <div className="admin-table-loading">
        <div className="loader-spinner" />
        <p>Cargando reservas...</p>
      </div>
    );
  }

  if (!reservas || reservas.length === 0) {
    return (
      <div className="admin-table-empty">
        <Calendar size={40} />
        <p>No hay reservas recientes para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario / Cancha</th>
            <th>Fecha y Horario</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Pago</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id ?? Math.random()} className="admin-table-row">
              <td className="td-id">#{r.id}</td>
              <td>
                <p className="td-main">{r.nombreUsuario ?? `Usuario #${r.usuarioId}`}</p>
                <p className="td-sub">Cancha #{r.canchaId}</p>
              </td>
              <td>
                <div className="td-datetime">
                  <span className="td-icon-row">
                    <Calendar size={13} /> {formatDateBO(r.fecha)}
                  </span>
                  <span className="td-icon-row">
                    <Clock size={13} /> {fmt(r.horaInicio)} – {fmt(r.horaFin)}
                  </span>
                </div>
              </td>
              <td>
                <span className="td-icon-row">
                  <CircleDollarSign size={14} />
                  {r.montoTotal} Bs.
                </span>
              </td>
              <td>{estadoBadge(r.estado)}</td>
              <td>{pagoBadge(r.estadoPago)}</td>
              <td>
                <div className="admin-table-actions">
                  {r.estado !== 'CANCELADA' && r.estadoPago === 'PENDIENTE' && !r.pagos?.some(p => p.urlComprobante) && (
                    <button
                      className="btn-action-pago"
                      onClick={() => r.id !== null && onRegistrarPago(r.id as number)}
                      title="Registrar pago presencial"
                    >
                      <Banknote size={14} /> Cobrar
                    </button>
                  )}
                  {r.estado !== 'CANCELADA' && r.pagos?.some(p => p.urlComprobante) && (
                    <button
                      className="btn-action-pago"
                      onClick={() => onVerComprobante(r)}
                      title="Ver comprobante subido"
                      style={{ backgroundColor: '#2563eb' }}
                    >
                      <Banknote size={14} /> Ver Comprobante
                    </button>
                  )}
                  {r.estado !== 'CANCELADA' && (
                    <button
                      className="btn-action-cancel-admin"
                      onClick={() => r.id !== null && onCancelar(r.id as number)}
                      title="Cancelar reserva"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  {r.estado === 'CANCELADA' && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={13} style={{ marginRight: 4 }} />
                      Cerrada
                    </span>
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
