import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Tag, BarChart2 } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'qa-gestion-canchas',
      icon: <Trophy size={22} />,
      label: 'Gestionar Canchas',
      description: 'Crear, editar o desactivar canchas del complejo',
      accent: 'accent-orange',
      path: '/admin/canchas',
    },
    {
      id: 'qa-gestion-precios',
      icon: <Tag size={22} />,
      label: 'Configurar Precios',
      description: 'Tarifas base, por día de semana y feriados',
      accent: 'accent-blue',
      path: '/admin/precios',
    },
    {
      id: 'qa-estadisticas',
      icon: <BarChart2 size={22} />,
      label: 'Ver Estadísticas',
      description: 'Ocupación y rendimiento del complejo',
      accent: 'accent-green',
      path: '/admin',
    },
  ];

  return (
    <div className="quick-actions-grid">
      {actions.map((a) => (
        <button
          key={a.id}
          id={a.id}
          className={`quick-action-card ${a.accent}`}
          onClick={() => navigate(a.path)}
        >
          <div className="qa-icon">{a.icon}</div>
          <div className="qa-body">
            <p className="qa-label">{a.label}</p>
            <p className="qa-desc">{a.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
