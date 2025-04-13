import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { useI18n } from '../i18n/I18nContext';
import { getUser } from '../services/userSession';
import { getChats, createChat } from '../services/chatService';

interface ChatHistoryItem {
  id: string;
  createdAt: string;
}

const ChatSidebar: React.FC<{
  onSelectChat: (id: string) => void;
  onCreateNew: () => void;
  currentChatId: string | null;
}> = ({ onSelectChat, onCreateNew, currentChatId }) => {
  const { t } = useI18n();
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      const user = getUser();
      if (!user) return;

      try {
        const chats = await getChats(user.id);
        setHistory(chats);
      } catch (err) {
        console.error('Erro ao buscar histórico de chats:', err);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = async () => {
    const user = getUser();
    if (!user) return;

    try {
      const newChat = await createChat(user.id);
      setHistory(prev => [newChat, ...prev]);
      onCreateNew();
      onSelectChat(newChat.id);
    } catch (err) {
      console.error('Erro ao criar novo chat:', err);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (chatId === currentChatId) onSelectChat('');
    // ➕ aqui você pode futuramente chamar uma API de delete (se quiser)
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-12' : 'w-64'
      } bg-[#111] text-white h-screen p-4 border-r border-gray-800 flex flex-col transition-all duration-300`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 self-end text-gray-400 hover:text-white"
        title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {!collapsed && (
        <>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl mb-6 font-semibold"
          >
            <Plus size={18} /> {t('sidebar.newConversation')}
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {history.map(item => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onSelectChat(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-gray-800 transition ${
                    currentChatId === item.id ? 'bg-gray-800' : 'bg-transparent'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span className="flex-1 truncate">{t('sidebar.newConversation')}</span>
                </button>

                <button
                  onClick={() => handleDeleteChat(item.id)}
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-400 transition-opacity opacity-0 group-hover:opacity-100"
                  title={t('sidebar.delete')}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
};

export default ChatSidebar;
