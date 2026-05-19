import React from 'react';
import { Clock, Info } from 'lucide-react';
import { type CanchaResponse, type SlotHorarioResponse } from '../../../../infrastructure/api/sportApi';
import './TabCanchas.css';

interface TabCanchasProps {
  canchas: CanchaResponse[];
  selectedCancha: CanchaResponse | null;
  setSelectedCancha: (cancha: CanchaResponse) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  loadingSlots: boolean;
  slots: SlotHorarioResponse[];
  selectedSlotsParaReserva: SlotHorarioResponse[];
  setSelectedSlotsParaReserva: (slots: SlotHorarioResponse[] | ((prev: SlotHorarioResponse[]) => SlotHorarioResponse[])) => void;
  handleOpenBookingModal: () => void;
}

export const TabCanchas: React.FC<TabCanchasProps> = ({
  canchas,
  selectedCancha,
  setSelectedCancha,
  selectedDate,
  setSelectedDate,
  loadingSlots,
  slots,
  selectedSlotsParaReserva,
  setSelectedSlotsParaReserva,
  handleOpenBookingModal
}) => {
  const toggleSlotSelection = (slot: SlotHorarioResponse) => {
    if (!slot.disponible) return;
    
    setSelectedSlotsParaReserva(prev => {
      const exists = prev.find(s => s.horaInicio === slot.horaInicio);
      if (exists) {
        return prev.filter(s => s.horaInicio !== slot.horaInicio);
      } else {
        return [...prev, slot];
      }
    });
  };

  return (
    <div className="tab-canchas-container">
      <div className="booking-control-card">
        <h2>Paso 1: Selecciona una Cancha y Fecha</h2>
        <div className="booking-inputs-row">
          <div className="input-group-booking">
            <label>Cancha</label>
            <select 
              value={selectedCancha?.id || ''} 
              onChange={(e) => {
                const c = canchas.find(item => item.id === Number(e.target.value));
                if (c) setSelectedCancha(c);
              }}
            >
              {canchas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.tipo})</option>
              ))}
            </select>
          </div>

          <div className="input-group-booking">
            <label>Fecha de Reserva</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {selectedCancha && (
        <div className="availability-results-section">
          <div className="cancha-detail-header">
            <div className="cancha-header-left">
              <h3>Disponibilidad para: {selectedCancha.nombre}</h3>
              <div className="cancha-badge-row">
                <span className="cancha-badge-type">{selectedCancha.tipo}</span>
                <span className="cancha-badge-cap">Capacidad: {selectedCancha.capacidad} jugadores</span>
              </div>
            </div>
            <span className="cancha-date-indicator">{selectedDate}</span>
          </div>

          {loadingSlots ? (
            <div className="slots-loader-placeholder">
              <div className="loader-spinner"></div>
              <p>Consultando franjas horarias disponibles...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="no-slots-alert">
              <Info size={32} />
              <p>No se encontraron horarios configurados para este día.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {[...slots].sort((a, b) => {
                if (a.disponible === b.disponible) {
                  return a.horaInicio.localeCompare(b.horaInicio);
                }
                return a.disponible ? -1 : 1;
              }).map((slot, index) => {
                const isSelected = selectedSlotsParaReserva.some(s => s.horaInicio === slot.horaInicio);
                return (
                  <div 
                    key={index} 
                    className={`slot-card-item ${slot.disponible ? 'disponible' : 'ocupado'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSlotSelection(slot)}
                    style={{ cursor: slot.disponible ? 'pointer' : 'default', border: isSelected ? '2px solid #f97316' : '' }}
                  >
                  <div className="slot-time-row">
                    <Clock size={16} />
                    <span>{slot.horaInicio.substring(0,5)} - {slot.horaFin.substring(0,5)}</span>
                  </div>
                  <div className="slot-price-row">
                    <span>{slot.precio} Bs.</span>
                  </div>
                  <div className="slot-action-area">
                    {slot.disponible ? (
                      <span style={{ color: isSelected ? '#f97316' : '#10b981', fontWeight: 'bold' }}>
                        {isSelected ? 'Seleccionado' : 'Disponible'}
                      </span>
                    ) : slot.expirado ? (
                      <span className="slot-badge-occupied" style={{ background: 'rgba(71, 85, 105, 0.4)', color: '#94a3b8', border: '1px solid rgba(71, 85, 105, 0.6)' }}>Expirado</span>
                    ) : (
                      <span className="slot-badge-occupied">Ocupado</span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
          
          {selectedSlotsParaReserva.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid #f97316', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Reserva en Progreso</h4>
                <p style={{ margin: 0, color: '#cbd5e1' }}>Has seleccionado {selectedSlotsParaReserva.length} franjas ({selectedSlotsParaReserva.length * 30} minutos).</p>
              </div>
              <button 
                className="btn-primary-action"
                onClick={handleOpenBookingModal}
              >
                Continuar con la Reserva
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
