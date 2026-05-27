import React, { useState, useEffect } from 'react';
import { X, Trophy, Save } from 'lucide-react';
import type { CanchaResponse, CanchaRequest } from '../../../../../domain/model/types';

interface CanchaFormModalProps {
  cancha: CanchaResponse | null;
  onClose: () => void;
  onSave: (data: CanchaRequest) => Promise<boolean>;
  loading: boolean;
}

export const CanchaFormModal: React.FC<CanchaFormModalProps> = ({
  cancha,
  onClose,
  onSave,
  loading,
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'FUTBOL' | 'WALLY'>('FUTBOL');
  const [capacidad, setCapacidad] = useState(10);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cancha) {
      setNombre(cancha.nombre);
      setTipo(cancha.tipo);
      setCapacidad(cancha.capacidad);
    } else {
      setNombre('');
      setTipo('FUTBOL');
      setCapacidad(10);
    }
  }, [cancha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre de la cancha es obligatorio.');
      return;
    }

    if (capacidad <= 0) {
      setError('La capacidad debe ser un número positivo.');
      return;
    }

    const success = await onSave({
      nombre: nombre.trim(),
      tipo,
      capacidad,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            {cancha ? 'Editar Cancha' : 'Nueva Cancha'}
          </h2>
          <button className="btn-close-modal" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {error && (
              <div className="admin-alert alert-danger" style={{ marginBottom: '1rem' }}>
                <span>{error}</span>
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="cancha-nombre" className="admin-label">Nombre de la cancha</label>
              <input
                id="cancha-nombre"
                type="text"
                className="admin-input"
                placeholder="Ej. Fútbol 1, Wally Pro"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="cancha-tipo" className="admin-label">Tipo de Deporte</label>
              <select
                id="cancha-tipo"
                className="admin-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'FUTBOL' | 'WALLY')}
                disabled={loading}
              >
                <option value="FUTBOL">⚽ Fútbol</option>
                <option value="WALLY">🏐 Wally</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="cancha-capacidad" className="admin-label">Capacidad (Jugadores)</label>
              <input
                id="cancha-capacidad"
                type="number"
                min="1"
                className="admin-input"
                value={capacidad}
                onChange={(e) => setCapacidad(parseInt(e.target.value) || 0)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-admin-primary"
              disabled={loading}
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <Save size={16} style={{ marginRight: 6 }} /> Guardar Cancha
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
