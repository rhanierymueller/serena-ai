import React from 'react';
import { MoreHorizontal, GripVertical } from 'lucide-react';
import { Client } from '../../../../types';
import StatusBadge from '../../../../components/status-badge/StatusBadge';
import MoodTrendIcon from '../mood-trend-icon/MoodTrendIcon';

interface ClientCardProps {
  client: Client;
  onClientClick: (client: Client) => void;
  onDragStart: (e: React.DragEvent, clientId: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, clientId: number) => void;
  isDragged: boolean;
  t: (key: string) => string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onClientClick,
  onDragStart,
  onDragOver,
  onDrop,
  isDragged,
  t,
}) => {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, client.id)}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, client.id)}
      className={`
        bg-black/30 border border-white/10 rounded-xl p-6 
        hover:border-white/20 transition-all cursor-move
        ${isDragged ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-gray-500" />
          <div className="text-2xl">{client.avatar}</div>
          <div>
            <h3 className="font-semibold text-white">{client.name}</h3>
            <p className="text-sm text-gray-400">{client.email}</p>
          </div>
        </div>
        <button
          onClick={() => onClientClick(client)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{t('professional.client.status')}:</span>
          <StatusBadge status={client.status} variant="professional" size="sm" />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{t('professional.client.sessions')}:</span>
          <span className="text-sm text-white font-medium">{client.sessionsCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{t('professional.client.plan')}:</span>
          <span className="text-sm text-white font-medium">{client.currentPlan}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{t('professional.client.moodTrend')}:</span>
          <MoodTrendIcon trend={client.moodTrend} size="sm" />
        </div>
      </div>
      <div className="border-t border-white/10 pt-4">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>
            {t('professional.client.lastSession')}: {client.lastSession}
          </span>
          <span>
            {t('professional.client.joined')}: {client.joinDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;