import React from 'react';
import { Users, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { ProfessionalStats } from '../../../../types';

interface ProfessionalDashboardProps {
  stats: ProfessionalStats;
  t: (key: string) => string;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ stats, t }) => {
  const dashboardCards = [
    {
      icon: Users,
      title: t('professional.dashboard.totalClients'),
      value: stats.totalClients,
      color: 'blue',
    },
    {
      icon: CheckCircle,
      title: t('professional.dashboard.activeClients'),
      value: stats.activeClients,
      color: 'green',
    },
    {
      icon: Clock,
      title: t('professional.dashboard.pendingClients'),
      value: stats.pendingClients,
      color: 'yellow',
    },
    {
      icon: BarChart3,
      title: t('professional.dashboard.totalSessions'),
      value: stats.totalSessions,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
      green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
      yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
      purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            const colorClasses = getColorClasses(card.color);
            return (
              <div
                key={index}
                className={`
                  bg-gradient-to-br ${colorClasses} 
                  backdrop-blur-sm border rounded-2xl p-6
                  hover:scale-105 transition-transform duration-200
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    className={`h-8 w-8 ${
                      card.color === 'blue'
                        ? 'text-blue-400'
                        : card.color === 'green'
                          ? 'text-green-400'
                          : card.color === 'yellow'
                            ? 'text-yellow-400'
                            : 'text-purple-400'
                    }`}
                  />
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    card.color === 'blue'
                      ? 'text-blue-400'
                      : card.color === 'green'
                        ? 'text-green-400'
                        : card.color === 'yellow'
                          ? 'text-yellow-400'
                          : 'text-purple-400'
                  }`}
                >
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProfessionalDashboard;