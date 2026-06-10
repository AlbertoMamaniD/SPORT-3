import React from 'react';
import { Calendar, Clock, CircleDollarSign, Plus, Trash2 } from 'lucide-react';
import { type ReservaResponse } from '../../../../infrastructure/api/sportApi';
import { formatDateBO } from '../../../../utils/dateUtils';
import './TabReservas.css';

interface TabReservasProps {
  loading: boolean;
  reservas: ReservaResponse[];
  getCanchaName: (id: number) => string;
  handleOpenExtendModal: (reserva: ReservaResponse) => void;
  handleCancelReserva: (id: number) => void;
  setCurrentTab: (tab: 'HOME' | 'CANCHAS' | 'RESERVAS') => void;
}

export const TabReservas: React.FC<TabReservasProps> = ({
  loading,
  reservas,
  getCanchaName,
  handleOpenExtendModal,
  handleCancelReserva,
  setCurrentTab
}) => {
  return (
    <div className="tab-reservas-container">
      <h2 className="reservas-section-title">Tu Historial de Reservas</h2>
      {loading ? (
        <div className="slots-loader-placeholder">
          <div className="loader-spinner"></div>
          <p>Cargando historial de reservas...</p>
        </div>
      ) : reservas.length === 0 ? (
        <div className="no-slots-alert">
          <Calendar size={32} />
          <p>Aún no has realizado ninguna reserva en SPORT 3.</p>
          <button className="btn-primary-action" onClick={() => setCurrentTab('CANCHAS')} style={{ marginTop: '1rem' }}>
            Reservar Mi Primer Cancha
          </button>
        </div>
      ) : (
        <div className="reservas-list-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="reserva-card-item">
              <div className="reserva-card-top">
                <h3>{getCanchaName(reserva.canchaId)}</h3>
                <span className={`reserva-status-badge ${reserva.estado.toLowerCase()}`}>
                  {reserva.estado}
                </span>
              </div>

              <div className="reserva-card-details">
                <div className="reserva-detail-row">
                  <Calendar size={14} />
                  <span>Fecha: {formatDateBO(reserva.fecha)}</span>
                </div>
                <div className="reserva-detail-row">
                  <Clock size={14} />
                  <span>Horario: {reserva.horaInicio.substring(0,5)} - {reserva.horaFin.substring(0,5)}</span>
                </div>
                <div className="reserva-detail-row">
                  <CircleDollarSign size={14} />
                  <span className="reserva-total-price">Monto Total: {reserva.montoTotal} Bs.</span>
                </div>
              </div>

              {reserva.estado !== 'CANCELADA' && (
                <div className="reserva-actions-footer">
                  <button 
                    className="btn-action-extend"
                    onClick={() => handleOpenExtendModal(reserva)}
                  >
                    <Plus size={14} /> Ampliar
                  </button>
                  <button 
                    className="btn-action-cancel"
                    onClick={() => reserva.id && handleCancelReserva(reserva.id)}
                  >
                    <Trash2 size={14} /> Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
