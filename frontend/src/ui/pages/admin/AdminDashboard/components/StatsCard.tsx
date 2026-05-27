import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: 'orange' | 'green' | 'blue' | 'yellow';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'orange',
}) => {
  const accentMap: Record<string, string> = {
    orange: 'stats-card-accent-orange',
    green:  'stats-card-accent-green',
    blue:   'stats-card-accent-blue',
    yellow: 'stats-card-accent-yellow',
  };

  return (
    <div className={`stats-card ${accentMap[accent]}`}>
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-body">
        <p className="stats-card-title">{title}</p>
        <p className="stats-card-value">{value}</p>
        {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};
