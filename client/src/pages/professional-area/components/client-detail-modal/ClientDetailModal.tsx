import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  Video,
  Send,
  Plus,
  FileText,
  CalendarPlus,
} from 'lucide-react';
import { Client, Note } from '../../../../types';
import StatusBadge from '../../../../components/status-badge/StatusBadge';
import MoodTrendIcon from '../mood-trend-icon/MoodTrendIcon';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
  onStartVideoCall: (client: Client) => void;
  onOpenScheduleModal: (client: Client) => void;
  onAddNote: (clientId: number, note: string) => void;
  t: (key: string) => string;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onStartVideoCall,
  onOpenScheduleModal,
  onAddNote,
  t,
}) => {
  const [newNote, setNewNote] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(client.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {

      console.log('Sending message:', chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{client.avatar}</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                <p className="text-gray-400">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={client.status} variant="professional" />
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#6DAEDB]" />
                {t('professional.client.basicInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">{t('professional.client.email')}:</span>
                  <span className="text-white">{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">{t('professional.client.phone')}:</span>
                  <span className="text-white">{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">{t('professional.client.joinDate')}:</span>
                  <span className="text-white">{client.joinDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{t('professional.client.sessions')}:</span>
                  <span className="text-white font-medium">{client.sessionsCount}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-gray-400">{t('professional.client.moodTrend')}:</span>
                <MoodTrendIcon trend={client.moodTrend} showLabel />
              </div>
            </div>

            {}
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#6DAEDB]" />
                {t('professional.client.clinicalNotes')}
              </h3>

              {}
              <div className="mb-4">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder={t('professional.client.addNote')}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="mt-2 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('professional.client.addNote')}
                </button>
              </div>

              {}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {client.clinicalNotes.map((note: Note) => (
                  <div
                    key={note.id}
                    className="bg-gray-800/50 border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{note.author}</span>
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                    <p className="text-white text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="space-y-6">
            {}
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('professional.client.actions')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => onStartVideoCall(client)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Video className="h-5 w-5" />
                  {t('professional.client.startVideoCall')}
                </button>
                <button
                  onClick={() => onOpenScheduleModal(client)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="h-5 w-5" />
                  {t('professional.client.scheduleMeeting')}
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  {showChat ? t('professional.client.hideChat') : t('professional.client.showChat')}
                </button>
              </div>
            </div>

            {}
            {showChat && (
              <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t('professional.client.quickChat')}
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-400 text-center">
                      {t('professional.client.noChatMessages')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder={t('professional.client.messagePlaceholder')}
                      className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none"
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-white p-2 rounded-lg transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;