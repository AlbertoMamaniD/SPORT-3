import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { CanchaResponse, ConfigurarPrecioRequest, DiaSemana } from '../../../../../domain/model/types';

interface PrecioFormModalProps {
  canchas: CanchaResponse[];
  onClose: () => void;
  onSave: (data: ConfigurarPrecioRequest) => Promise<boolean>;
  loading: boolean;
}

const DIAS_OPCIONES: { label: string; value: DiaSemana }[] = [
  { label: 'Lunes', value: 'LUNES' },
  { label: 'Martes', value: 'MARTES' },
  { label: 'Miércoles', value: 'MIERCOLES' },
  { label: 'Jueves', value: 'JUEVES' },
  { label: 'Viernes', value: 'VIERNES' },
  { label: 'Sábado', value: 'SABADO' },
  { label: 'Domingo', value: 'DOMINGO' },
];

export const PrecioFormModal: React.FC<PrecioFormModalProps> = ({
  canchas,
  onClose,
  onSave,
  loading,
}) => {
  const [canchaId, setCanchaId] = useState<number>(canchas[0]?.id ?? 0);
  const [precioHora, setPrecioHora] = useState<number>(50);
  const [horaInicio, setHoraInicio] = useState<string>('07:00');
  const [horaFin, setHoraFin] = useState<string>('23:00');
  
  // Condición
  const [tipoCondicion, setTipoCondicion] = useState<'DIA' | 'FERIADO'>('DIA');
  const [diaSemana, setDiaSemana] = useState<DiaSemana>('LUNES');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canchaId) {
      setError('Debes seleccionar una cancha.');
      return;
    }

    if (precioHora <= 0) {
      setError('La tarifa debe ser un número positivo.');
      return;
    }

    if (!horaInicio || !horaFin) {
      setError('Los horarios son obligatorios.');
      return;
    }

    if (horaInicio >= horaFin) {
      setError('La hora de inicio debe ser menor que la hora de fin.');
      return;
    }

    // Convert "HH:mm" to "HH:mm:ss"
    const startStr = `${horaInicio}:00`;
    const endStr = `${horaFin}:00`;

    const requestData: ConfigurarPrecioRequest = {
      canchaId,
      precioHora,
      horaInicio: startStr,
      horaFin: endStr,
    };

    if (tipoCondicion === 'FERIADO') {
      requestData.esFeriado = true;
    } else {
      requestData.diaSemana = diaSemana;
      requestData.esFeriado = false;
    }

    const success = await onSave(requestData);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Configurar Tarifa Especial</h2>
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
              <label htmlFor="precio-cancha" className="admin-label">Cancha</label>
              <select
                id="precio-cancha"
                className="admin-select"
                value={canchaId}
                onChange={(e) => setCanchaId(Number(e.target.value))}
                disabled={loading}
              >
                {canchas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.tipo === 'FUTBOL' ? 'Fútbol' : 'Wally'})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="precio-monto" className="admin-label">Tarifa (Bs. / Hora)</label>
              <input
                id="precio-monto"
                type="number"
                min="1"
                className="admin-input"
                value={precioHora}
                onChange={(e) => setPrecioHora(Number(e.target.value) || 0)}
                disabled={loading}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label htmlFor="precio-inicio" className="admin-label">Hora Inicio</label>
                <input
                  id="precio-inicio"
                  type="time"
                  className="admin-input"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="precio-fin" className="admin-label">Hora Fin</label>
                <input
                  id="precio-fin"
                  type="time"
                  className="admin-input"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Aplicar en:</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="tipoCondicion"
                    checked={tipoCondicion === 'DIA'}
                    onChange={() => setTipoCondicion('DIA')}
                    disabled={loading}
                  />
                  Día Específico
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="tipoCondicion"
                    checked={tipoCondicion === 'FERIADO'}
                    onChange={() => setTipoCondicion('FERIADO')}
                    disabled={loading}
                  />
                  Feriado
                </label>
              </div>

              {tipoCondicion === 'DIA' && (
                <select
                  id="precio-dia"
                  className="admin-select"
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value as DiaSemana)}
                  disabled={loading}
                >
                  {DIAS_OPCIONES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
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
                  <Save size={16} style={{ marginRight: 6 }} /> Guardar Tarifa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
