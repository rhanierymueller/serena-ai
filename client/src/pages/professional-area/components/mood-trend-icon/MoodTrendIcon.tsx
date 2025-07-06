import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodTrendIconProps {
  trend: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const MoodTrendIcon: React.FC<MoodTrendIconProps> = ({
  trend,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const getTrendConfig = (trend: string) => {
    const configs = {
      improving: {
        icon: TrendingUp,
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        label: 'Melhorando',
        emoji: '📈',
      },
      stable: {
        icon: Minus,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        label: 'Estável',
        emoji: '➖',
      },
      declining: {
        icon: TrendingDown,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        label: 'Declinando',
        emoji: '📉',
      },
    };

    return configs[trend as keyof typeof configs] || configs.stable;
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const getContainerSizeClasses = (size: string) => {
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const config = getTrendConfig(trend);
  const Icon = config.icon;
  const sizeClasses = getSizeClasses(size);
  const containerSizeClasses = getContainerSizeClasses(size);

  if (showLabel) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div
          className={`${config.bgColor} ${containerSizeClasses} rounded-full flex items-center justify-center`}
        >
          <Icon className={`${config.color} ${sizeClasses}`} />
        </div>
        <span className={`${config.color} text-sm font-medium`}>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`
        ${config.bgColor} ${containerSizeClasses} 
        rounded-full flex items-center justify-center 
        transition-all hover:scale-110
        ${className}
      `}
      title={config.label}
    >
      <Icon className={`${config.color} ${sizeClasses}`} />
    </div>
  );
};

export default MoodTrendIcon;