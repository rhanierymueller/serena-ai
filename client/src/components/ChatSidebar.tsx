import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, X, LogOut } from 'lucide-react';

import { useI18n } from '../i18n/I18nContext';
import { getUser } from '../services/userSession';
import { checkAuth, fetchUserProfile } from '../services/userService';
import { getChats, createChat, deleteChat } from '../services/chatService';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

interface ChatHistoryItem {
  id: string;
  createdAt: string;
  title: string;
}

const ChatSidebar: React.FC<{
  onSelectChat: (id: string) => void;
  onCreateNew: () => void;
  currentChatId: string | null;
  onCloseMobileSidebar?: () => void;
  onDeleteChat?: () => void;
}> = ({ onSelectChat, onCreateNew, currentChatId, onCloseMobileSidebar, onDeleteChat }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const user = await checkAuth();
        const userId = user?.id ?? null;
        const chats = await getChats(userId);
        setHistory(chats);
      } catch (err) {
        console.error('Erro ao buscar histórico de chats:', err);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = async () => {
    try {
      const user = await checkAuth();
      const userId = user?.id ?? null;
      const newChat = await createChat(userId);
      setHistory(prev => [newChat, ...prev]);
      onCreateNew();
      onSelectChat(newChat.id);
    } catch (err) {
      console.error('Erro ao criar novo chat:', err);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      const user = await checkAuth();
      const userId = user?.id ?? null;
      await deleteChat(chatToDelete, userId);
      setHistory(prev => prev.filter(chat => chat.id !== chatToDelete));
      if (chatToDelete === currentChatId) {
        onSelectChat('');
        onDeleteChat?.();
      }
    } catch (err) {
      console.error('Erro ao deletar chat:', err);
    } finally {
      setShowModal(false);
      setChatToDelete(null);
    }
  };

  return (
    <>
      <aside
        className={`${
          collapsed ? 'w-12' : 'w-64'
        } bg-[#111] text-white h-screen p-4 border-r border-gray-800 flex flex-col transition-all duration-300`}
      >
        <div className="flex justify-between items-center mb-6">
          {onCloseMobileSidebar && (
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
              title={t('sidebar.exit')}
            >
              <LogOut size={20} />
            </button>
          )}
          <button
            onClick={() => {
              if (onCloseMobileSidebar) {
                onCloseMobileSidebar();
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="self-end text-gray-400 hover:text-white"
            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {!collapsed && (
          <>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl mb-6 font-semibold"
            >
              <Plus size={18} /> {t('sidebar.newConversation')}
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {history.map(item => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onSelectChat(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-[#1f2d36] transition ${
                      currentChatId === item.id ? 'bg-[#1f2d36]' : 'bg-transparent'
                    }`}
                  >
                    <MessageSquare size={16} />
                    <span className="flex-1 truncate">
                      {item?.title?.length > 0
                        ? item.title.slice(0, 8) + (item.title.length > 8 ? '...' : '')
                        : t('sidebar.newConversation')}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setChatToDelete(item.id);
                      setShowModal(true);
                    }}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-[#6DAEDB] transition-opacity opacity-0 group-hover:opacity-100"
                    title={t('sidebar.delete')}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-auto pt-4 flex justify-center">
          {!collapsed ? (
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black rounded-lg text-sm transition"
            >
              <LogOut size={16} />
              <span>{t('sidebar.exit')}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black p-2 rounded-full transition"
              title={t('sidebar.exit')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {showModal && (
        <Modal
          title={t('sidebar.deleteConfirmTitle')}
          description={t('sidebar.deleteConfirmDescription')}
          onConfirm={handleDeleteChat}
          onCancel={() => {
            setShowModal(false);
            setChatToDelete(null);
          }}
          confirmText={t('sidebar.deleteConfirmBtn')}
          cancelText={t('sidebar.cancel')}
          size="sm"
        />
      )}
    </>
  );
};

export default ChatSidebar;
