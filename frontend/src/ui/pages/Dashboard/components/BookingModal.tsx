import React, { useRef, useState } from 'react';
import { X, CreditCard, CircleDollarSign, Upload, CheckCircle2, Image } from 'lucide-react';
import { type CanchaResponse, type SlotHorarioResponse } from '../../../../infrastructure/api/sportApi';
import { formatDateBO } from '../../../../utils/dateUtils';
import './BookingModal.css';

interface BookingModalProps {
  showBookingModal: boolean;
  setShowBookingModal: (show: boolean) => void;
  selectedSlotsParaReserva: SlotHorarioResponse[];
  selectedCancha: CanchaResponse;
  selectedDate: string;
  payingQr: boolean;
  setPayingQr: (paying: boolean) => void;
  metodoPago: 'ONLINE' | 'PRESENCIAL';
  setMetodoPago: (metodo: 'ONLINE' | 'PRESENCIAL') => void;
  handleConfirmBooking: (comprobante: File | null) => void;
  loading: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  showBookingModal,
  setShowBookingModal,
  selectedSlotsParaReserva,
  selectedCancha,
  selectedDate,
  payingQr,
  setPayingQr,
  metodoPago,
  setMetodoPago,
  handleConfirmBooking,
  loading
}) => {
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showBookingModal || selectedSlotsParaReserva.length === 0 || !selectedCancha) return null;

  const sortedSlots = [...selectedSlotsParaReserva].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const horaInicio = sortedSlots[0].horaInicio.substring(0, 5);
  const horaFin = sortedSlots[sortedSlots.length - 1].horaFin.substring(0, 5);
  const precioTotal = sortedSlots.reduce((total, slot) => total + slot.precio, 0);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se aceptan imágenes (JPG, PNG, etc.)');
      return;
    }
    setComprobante(file);
    const reader = new FileReader();
    reader.onloadend = () => setComprobantePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleClose = () => {
    setComprobante(null);
    setComprobantePreview(null);
    setShowBookingModal(false);
  };

  const handleBack = () => {
    setComprobante(null);
    setComprobantePreview(null);
    setPayingQr(false);
  };

  // Para QR, solo habilitamos Confirmar si tiene comprobante
  const canConfirm = metodoPago === 'PRESENCIAL' || !payingQr || comprobante !== null;

  return (
    <div className="dashboard-modal-backdrop">
      <div className="dashboard-modal-content">
        <div className="modal-header">
          <h2>Confirmar Reserva de Cancha</h2>
          <button className="btn-close-modal" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Resumen siempre visible */}
          <div className="checkout-summary-box">
            <div className="checkout-row">
              <span>Cancha:</span>
              <strong>{selectedCancha.nombre} ({selectedCancha.tipo})</strong>
            </div>
            <div className="checkout-row">
              <span>Fecha:</span>
              <strong>{formatDateBO(selectedDate)}</strong>
            </div>
            <div className="checkout-row">
              <span>Horario:</span>
              <strong>{horaInicio} - {horaFin}</strong>
            </div>
            <div className="checkout-row">
              <span>Tiempo Total:</span>
              <strong>{selectedSlotsParaReserva.length * 30} Minutos</strong>
            </div>
            <div className="checkout-row">
              <span>Monto Total:</span>
              <strong className="price-highlight">{precioTotal} Bs.</strong>
            </div>
          </div>

          {!payingQr ? (
            /* PASO 1: Selección de método de pago */
            <div className="payment-method-selector">
              <p className="section-subtitle">Selecciona tu método de pago:</p>
              <div className="payment-options">
                <div
                  className={`payment-option-card ${metodoPago === 'ONLINE' ? 'active' : ''}`}
                  onClick={() => setMetodoPago('ONLINE')}
                >
                  <CreditCard size={24} />
                  <div className="option-info">
                    <strong>QR / Transferencia</strong>
                    <span>Pago inmediato con código QR</span>
                  </div>
                </div>

                <div
                  className={`payment-option-card ${metodoPago === 'PRESENCIAL' ? 'active' : ''}`}
                  onClick={() => setMetodoPago('PRESENCIAL')}
                >
                  <CircleDollarSign size={24} />
                  <div className="option-info">
                    <strong>Pago en Cancha</strong>
                    <span>Pagas en efectivo al llegar al complejo</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PASO 2: QR + Subida de Comprobante */
            <div className="qr-payment-screen">
              <p className="qr-instruction">
                Escanea este código QR desde tu app bancaria para completar la transferencia:
              </p>

              {/* QR animado */}
              <div className="qr-wrapper-box">
                <div className="qr-scan-line"></div>
                <svg viewBox="0 0 100 100" className="qr-svg-mockup">
                  <rect width="100" height="100" fill="#f8fafc" rx="8" />
                  <rect x="10" y="10" width="25" height="25" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <rect x="15" y="15" width="15" height="15" fill="#1e293b" />
                  <rect x="65" y="10" width="25" height="25" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <rect x="70" y="15" width="15" height="15" fill="#1e293b" />
                  <rect x="10" y="65" width="25" height="25" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <rect x="15" y="70" width="15" height="15" fill="#1e293b" />
                  <rect x="45" y="15" width="5" height="15" fill="#1e293b" />
                  <rect x="40" y="35" width="20" height="5" fill="#1e293b" />
                  <rect x="45" y="45" width="5" height="15" fill="#1e293b" />
                  <rect x="15" y="45" width="15" height="5" fill="#1e293b" />
                  <rect x="75" y="45" width="10" height="20" fill="#1e293b" />
                  <rect x="45" y="70" width="15" height="15" fill="#1e293b" />
                  <rect x="70" y="75" width="15" height="5" fill="#1e293b" />
                </svg>
              </div>

              <div className="qr-status-indicator">
                <span className="indicator-pulse"></span>
                <span>Esperando transferencia bancaria...</span>
              </div>

              {/* --- ZONA DE SUBIDA DE COMPROBANTE --- */}
              <div className="comprobante-section">
                <p className="section-subtitle" style={{ marginBottom: '0.75rem' }}>
                  Luego de transferir, sube tu comprobante:
                </p>

                {!comprobantePreview ? (
                  <div
                    className={`comprobante-upload-zone ${dragOver ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload size={28} strokeWidth={1.5} />
                    <strong>Haz clic o arrastra tu imagen aquí</strong>
                    <span>JPG, PNG, WEBP — Máx. 5MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    />
                  </div>
                ) : (
                  <div className="comprobante-preview-box">
                    <img src={comprobantePreview} alt="Comprobante" className="comprobante-preview-img" />
                    <div className="comprobante-preview-info">
                      <CheckCircle2 size={18} color="#34d399" />
                      <span>{comprobante?.name}</span>
                    </div>
                    <button
                      className="comprobante-change-btn"
                      onClick={() => { setComprobante(null); setComprobantePreview(null); }}
                    >
                      <Image size={14} /> Cambiar imagen
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel-modal"
            onClick={payingQr ? handleBack : handleClose}
            disabled={loading}
          >
            {payingQr ? 'Atrás' : 'Cancelar'}
          </button>
          <button
            className="btn-confirm-modal"
            onClick={() => handleConfirmBooking(comprobante)}
            disabled={loading || !canConfirm}
            style={{ opacity: canConfirm ? 1 : 0.5, cursor: canConfirm ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Procesando...' : payingQr ? 'Confirmar Pago' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};
