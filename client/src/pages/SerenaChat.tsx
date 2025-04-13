import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Send, AlertTriangle, LogOut } from 'lucide-react';
import ChatSidebar from '../components/ChatSidebar';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { createChat, getChats } from '../services/chatService';
import { getMessages, sendMessage } from '../services/messageService';
import { getUser } from '../services/userSession';
import { generateReply } from '../services/llmService';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ApiMessage {
  role: string;
  content: string;
}

const SerenaChat: React.FC = () => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState<'pro' | 'free'>('free');
  const [isTyping, setIsTyping] = useState(false);

  const [chatId, setChatId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initChat = async () => {
      const user = getUser();
      if (!user) return;
      setPlan(user.plan);
      const chats = await getChats(user.id);
      if (chats.length > 0) {
        setChatId(chats[0].id);
        const loadedMessages: ApiMessage[] = await getMessages(chats[0].id);
        setMessages(
          loadedMessages.map(
            (m): Message => ({
              sender: m.role === 'user' ? 'user' : 'bot',
              text: m.content,
            })
          )
        );
      } else {
        const newChat = await createChat(user.id);
        setChatId(newChat.id);
      }
    };

    initChat();
  }, []);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !chatId) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    await sendMessage(chatId, 'user', text);

    if (plan === 'free') setIsTyping(true);

    try {
      const botReply = await generateReply(chatId);
      const botMsg: Message = { sender: 'bot', text: botReply.content };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-white">
      <ChatSidebar
        currentChatId={chatId}
        onSelectChat={id => setChatId(id)}
        onCreateNew={() => setMessages([])}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-6">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            title={t('chat.goHome')}
          >
            <Bot size={32} className="text-green-500" />
            <h1 className="text-2xl md:text-3xl font-bold font-sans text-white">
              {t('header.title')}
            </h1>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-transform hover:scale-110"
            title={t('chat.goHome')}
          >
            <LogOut size={28} />
          </button>
        </div>

        <div className="px-4 pt-2">
          <span
            className={`text-xs px-3 py-1 rounded-xl text-white ${
              plan === 'pro' ? 'bg-blue-700' : 'bg-green-700'
            }`}
          >
            Plano: {plan === 'pro' ? 'Pro' : 'Gratuito'}
          </span>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${
                  msg.sender === 'user' ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 p-4 bg-[#1a1a1a]">
          {isTyping && (
            <div className="text-xs text-gray-400 mb-2 ml-1 animate-pulse">
              Serena está digitando...
            </div>
          )}
          <div className="w-full flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
              placeholder={t('chat.placeholder')}
              rows={2}
              className="flex-1 bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
            <button
              onClick={() => handleSend(input)}
              className="bg-green-600 hover:bg-green-500 p-3 rounded-xl text-white transition-colors"
              title={t('chat.send')}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        <div className="bg-[#111] text-xs text-gray-400 text-center px-4 py-3 border-t border-gray-800 flex items-center justify-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span>{t('chat.warning')}</span>
        </div>
      </div>
    </div>
  );
};

export default SerenaChat;
