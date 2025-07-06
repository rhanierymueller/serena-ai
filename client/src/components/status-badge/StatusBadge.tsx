import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'professional';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        text: 'Ativo',
        icon: '✅',
      },
      inactive: {
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        text: 'Inativo',
        icon: '⚫',
      },
      pending: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        text: 'Pendente',
        icon: '⏳',
      },
      completed: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        text: 'Concluído',
        icon: '✅',
      },
      cancelled: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        text: 'Cancelado',
        icon: '❌',
      },
      scheduled: {
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        text: 'Agendado',
        icon: '📅',
      },
    };

    return configs[status as keyof typeof configs] || configs.inactive;
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-1',
      lg: 'text-base px-4 py-2',
    };

    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium transition-all
        ${config.color} 
        ${sizeClasses}
        ${variant === 'professional' ? 'shadow-sm' : ''}
        ${className}
      `}
    >
      {variant === 'professional' && <span className="text-xs">{config.icon}</span>}
      {config.text}
    </span>
  );
};

export default StatusBadge;