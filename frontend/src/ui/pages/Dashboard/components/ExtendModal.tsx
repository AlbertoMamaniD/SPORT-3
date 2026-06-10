import React, { useRef, useState } from 'react';
import { X, CreditCard, CircleDollarSign, Upload, CheckCircle2, Image } from 'lucide-react';
import { type ReservaResponse } from '../../../../infrastructure/api/sportApi';
import { formatDateBO } from '../../../../utils/dateUtils';
import './ExtendModal.css';
import './BookingModal.css'; // Estilos compartidos: QR, comprobante, payment-options

interface ExtendModalProps {
  showExtendModal: boolean;
  setShowExtendModal: (show: boolean) => void;
  extendModalReserva: ReservaResponse | null;
  getCanchaName: (id: number) => string;
  minutosExtra: number;
  setMinutosExtra: (minutos: number) => void;
  handleConfirmExtend: (comprobante: File | null, metodoPago: 'ONLINE' | 'PRESENCIAL') => void;
  loading: boolean;
}

type ExtendStep = 'SELECT_TIME' | 'SELECT_PAYMENT' | 'QR_COMPROBANTE';

export const ExtendModal: React.FC<ExtendModalProps> = ({
  showExtendModal,
  setShowExtendModal,
  extendModalReserva,
  getCanchaName,
  minutosExtra,
  setMinutosExtra,
  handleConfirmExtend,
  loading
}) => {
  const [step, setStep] = useState<ExtendStep>('SELECT_TIME');
  const [metodoPago, setMetodoPago] = useState<'ONLINE' | 'PRESENCIAL'>('ONLINE');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showExtendModal || !extendModalReserva) return null;

  // Precio estimado: precio original / minutos originales * minutos extra
  const duracionOriginalMin = (() => {
    const [h1, m1] = extendModalReserva.horaInicio.split(':').map(Number);
    const [h2, m2] = extendModalReserva.horaFin.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  })();
  const precioPorMinuto = duracionOriginalMin > 0 ? extendModalReserva.montoTotal / duracionOriginalMin : 0;
  const precioExtra = Math.round(precioPorMinuto * minutosExtra);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo se aceptan imágenes.'); return; }
    setComprobante(file);
    const reader = new FileReader();
    reader.onloadend = () => setComprobantePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleClose = () => {
    setStep('SELECT_TIME');
    setMetodoPago('ONLINE');
    setComprobante(null);
    setComprobantePreview(null);
    setShowExtendModal(false);
  };

  const handleBack = () => {
    if (step === 'QR_COMPROBANTE') {
      setComprobante(null);
      setComprobantePreview(null);
      setStep('SELECT_PAYMENT');
    } else if (step === 'SELECT_PAYMENT') {
      setStep('SELECT_TIME');
    }
  };

  const handleNext = () => {
    if (step === 'SELECT_TIME') setStep('SELECT_PAYMENT');
    else if (step === 'SELECT_PAYMENT') {
      if (metodoPago === 'ONLINE') setStep('QR_COMPROBANTE');
      else { handleConfirmExtend(null, 'PRESENCIAL'); handleClose(); }
    } else if (step === 'QR_COMPROBANTE') {
      handleConfirmExtend(comprobante, 'ONLINE');
      handleClose();
    }
  };

  const canConfirm = step !== 'QR_COMPROBANTE' || comprobante !== null;

  const stepTitles: Record<ExtendStep, string> = {
    SELECT_TIME: 'Ampliar Reserva',
    SELECT_PAYMENT: 'Método de Pago',
    QR_COMPROBANTE: 'Pago QR'
  };

  return (
    <div className="dashboard-modal-backdrop">
      <div className="dashboard-modal-content">
        <div className="modal-header">
          <div className="extend-header-left">
            <h2>{stepTitles[step]}</h2>
            <div className="extend-step-indicators">
              {(['SELECT_TIME', 'SELECT_PAYMENT', 'QR_COMPROBANTE'] as ExtendStep[]).map((s, i) => (
                <span key={s} className={`step-dot ${step === s ? 'active' : ((['SELECT_TIME', 'SELECT_PAYMENT', 'QR_COMPROBANTE'].indexOf(step) > i) ? 'done' : '')}`} />
              ))}
            </div>
          </div>
          <button className="btn-close-modal" onClick={handleClose}><X size={20} /></button>
        </div>

        <div className="modal-body">

          {/* PASO 1: Selección de tiempo */}
          {step === 'SELECT_TIME' && (
            <>
              <p className="extend-instruction">
                ¿Cuánto tiempo extra necesitas en la cancha <strong>{getCanchaName(extendModalReserva.canchaId)}</strong>?
              </p>

              <div className="extend-summary-box">
                <div className="checkout-row"><span>Fecha:</span><strong>{formatDateBO(extendModalReserva.fecha)}</strong></div>
                <div className="checkout-row">
                  <span>Horario Actual:</span>
                  <strong>{extendModalReserva.horaInicio.substring(0,5)} - {extendModalReserva.horaFin.substring(0,5)}</strong>
                </div>
                <div className="checkout-row"><span>Monto Original:</span><strong>{extendModalReserva.montoTotal} Bs.</strong></div>
              </div>

              <div className="extend-options-grid">
                {[30, 60, 120].map(min => (
                  <button
                    key={min}
                    className={`extend-option-btn ${minutosExtra === min ? 'active' : ''}`}
                    onClick={() => setMinutosExtra(min)}
                  >
                    <span className="option-min">+{min} min</span>
                    <span className="option-label">{min < 60 ? 'Media hora' : min === 60 ? '1 Hora' : '2 Horas'}</span>
                    {precioPorMinuto > 0 && (
                      <span className="option-price">~{Math.round(precioPorMinuto * min)} Bs.</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="extend-note">
                * El cobro adicional se calcula en base a la tarifa de tu reserva original.
              </p>
            </>
          )}

          {/* PASO 2: Selección de método de pago */}
          {step === 'SELECT_PAYMENT' && (
            <>
              <div className="extend-summary-box">
                <div className="checkout-row"><span>Tiempo Extra:</span><strong>+{minutosExtra} minutos</strong></div>
                <div className="checkout-row">
                  <span>Costo Adicional:</span>
                  <strong className="price-highlight">{precioExtra > 0 ? `${precioExtra} Bs.` : 'Según tarifa'}</strong>
                </div>
              </div>

              <p className="extend-instruction">¿Cómo deseas pagar la extensión?</p>

              <div className="payment-options">
                <div
                  className={`payment-option-card ${metodoPago === 'ONLINE' ? 'active' : ''}`}
                  onClick={() => setMetodoPago('ONLINE')}
                >
                  <CreditCard size={24} />
                  <div className="option-info">
                    <strong>QR / Transferencia</strong>
                    <span>Pagas ahora con código QR bancario</span>
                  </div>
                </div>

                <div
                  className={`payment-option-card ${metodoPago === 'PRESENCIAL' ? 'active' : ''}`}
                  onClick={() => setMetodoPago('PRESENCIAL')}
                >
                  <CircleDollarSign size={24} />
                  <div className="option-info">
                    <strong>Pago en Cancha</strong>
                    <span>Le pagas al encargado en el complejo</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PASO 3: QR + Comprobante */}
          {step === 'QR_COMPROBANTE' && (
            <div className="qr-payment-screen">
              <p className="qr-instruction">Escanea este código QR para pagar <strong>{precioExtra > 0 ? `${precioExtra} Bs.` : 'el monto adicional'}</strong>:</p>

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
                  <rect x="75" y="45" width="10" height="20" fill="#1e293b" />
                  <rect x="45" y="70" width="15" height="15" fill="#1e293b" />
                  <rect x="70" y="75" width="15" height="5" fill="#1e293b" />
                </svg>
              </div>

              <div className="qr-status-indicator">
                <span className="indicator-pulse"></span>
                <span>Esperando transferencia bancaria...</span>
              </div>

              {/* Subida de comprobante */}
              <div className="comprobante-section" style={{ textAlign: 'left', width: '100%' }}>
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
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
                  </div>
                ) : (
                  <div className="comprobante-preview-box">
                    <img src={comprobantePreview} alt="Comprobante" className="comprobante-preview-img" />
                    <div className="comprobante-preview-info">
                      <CheckCircle2 size={18} color="#34d399" />
                      <span>{comprobante?.name}</span>
                    </div>
                    <button className="comprobante-change-btn" onClick={() => { setComprobante(null); setComprobantePreview(null); }}>
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
            onClick={step === 'SELECT_TIME' ? handleClose : handleBack}
            disabled={loading}
          >
            {step === 'SELECT_TIME' ? 'Cancelar' : 'Atrás'}
          </button>
          <button
            className="btn-confirm-modal"
            onClick={handleNext}
            disabled={loading || !canConfirm}
            style={{ opacity: canConfirm ? 1 : 0.5, cursor: canConfirm ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Procesando...' :
              step === 'SELECT_TIME' ? 'Siguiente →' :
              step === 'SELECT_PAYMENT' ? (metodoPago === 'ONLINE' ? 'Ir a Pagar →' : 'Confirmar Ampliación') :
              'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};
