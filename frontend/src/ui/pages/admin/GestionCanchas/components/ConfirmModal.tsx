import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
  danger = false,
}) => {
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-content" style={{ maxWidth: '400px' }}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {danger && <AlertTriangle size={20} color="#ef4444" />}
            {title}
          </h2>
          <button className="btn-close-modal" onClick={onCancel} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body">
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={danger ? 'btn-admin-danger' : 'btn-admin-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
