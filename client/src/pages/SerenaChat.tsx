import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, Send, AlertTriangle, LogOut, Square } from 'lucide-react';
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

const SerenaChat: React.FC = () => {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState<'pro' | 'free'>('free');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const navigate = useNavigate();

  const removeEmojis = (text: string) =>
    text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g, '');

  const narrateText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    const cleanText = removeEmojis(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;

    let langCode = 'pt-BR';
    if (language === 'en') langCode = 'en-US';
    if (language === 'es') langCode = 'es-ES';
    utterance.lang = langCode;

    const assignVoiceAndSpeak = () => {
      const voices = speechSynthesis.getVoices();
      const femaleVoiceNames = {
        'pt-BR': [
          'Luciana',
          'Microsoft Maria Desktop',
          'Google português do Brasil',
          'pt-BR-Wavenet-F',
        ],
        'en-US': ['Samantha', 'Google US English', 'en-US-Wavenet-F'],
        'es-ES': ['Conchita', 'Google español', 'es-ES-Wavenet-F'],
      } as const;

      type Lang = keyof typeof femaleVoiceNames;
      let lc: Lang = 'pt-BR';
      if (language === 'en') lc = 'en-US';
      if (language === 'es') lc = 'es-ES';

      const names = femaleVoiceNames[lc] || [];
      let preferred = voices.find(v =>
        names.some(n => v.name.toLowerCase().includes(n.toLowerCase()))
      );
      if (!preferred) preferred = voices.find(v => v.lang === lc);
      if (preferred) {
        utterance.voice = preferred;
        console.log('[🔊 Voz selecionada]', preferred.name);
      }

      setIsNarrating(true);
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    };

    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        assignVoiceAndSpeak();
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      assignVoiceAndSpeak();
    }
  };

  const stopNarration = () => {
    speechSynthesis.cancel();
    setIsNarrating(false);
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => handleSend(e.results[0][0].transcript, true);
    recognitionRef.current = recognition;
  };

  const handleSend = async (text: string, fromVoice = false) => {
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
      if (fromVoice) narrateText(botReply.content);
    } catch (err) {
      console.error('Erro ao buscar resposta:', err);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const user = getUser();
      if (user?.plan) setPlan(user.plan);
      const chats = await getChats(user?.id ?? null);
      if (chats.length) {
        setChatId(chats[0].id);
        const msgs = await getMessages(chats[0].id);
        setMessages(
          msgs.map((m: { role: string; content: any }) => ({
            sender: m.role === 'user' ? 'user' : 'bot',
            text: m.content,
          }))
        );
      } else {
        const newChat = await createChat(user?.id ?? null);
        setChatId(newChat.id);
      }
    };
    init();
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-white">
      {/* Sidebar desktop */}
      <div className="hidden sm:block">
        <ChatSidebar
          currentChatId={chatId}
          onSelectChat={id => setChatId(id)}
          onCreateNew={() => setMessages([])}
        />
      </div>

      {/* Sidebar mobile overlay */}
      {showSidebarMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex">
          <div className="w-64 bg-[#111] flex flex-col h-full">
            <ChatSidebar
              currentChatId={chatId}
              onSelectChat={id => {
                setChatId(id);
                setShowSidebarMobile(false);
              }}
              onCreateNew={() => {
                setMessages([]);
                setShowSidebarMobile(false);
              }}
              onCloseMobileSidebar={() => setShowSidebarMobile(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setShowSidebarMobile(false)} />
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile menu button */}
        <div className="sm:hidden px-4 pt-2">
          <button
            onClick={() => setShowSidebarMobile(true)}
            className="text-white bg-[#6DAEDB] px-3 py-2 rounded-xl"
          >
            ☰ {t('sidebar.menu')}
          </button>
        </div>

        {/* Plan label */}
        <div className="px-4 pt-2">
          <span
            className={`text-xs px-3 py-1 rounded-xl text-white ${
              plan === 'pro' ? 'bg-[#6DAEDB] text-black' : 'bg-[#2C3E50]'
            }
          `}
          >
            {t('chat.planLabel')}: {t(`chat.plan.${plan}`)}
          </span>
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="flex items-center gap-3 mb-8">
              <Bot size={56} className="text-[#6DAEDB]" />
              <h1 className="text-3xl md:text-4xl font-bold font-sans text-white">
                {t('header.title')}
              </h1>
            </div>
            <div className="w-full max-w-lg">
              <div className="border border-gray-700 rounded-2xl bg-[#1a1a1a] p-4">
                {/* input area empty state */}
                <div className="w-full flex flex-row items-end gap-2">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(input);
                      }
                    }}
                    maxLength={800}
                    placeholder={t('chat.placeholder')}
                    rows={2}
                    className="flex-1 text-base sm:text-sm bg-[#1f2d36] border border-[#2a3b47] text-white placeholder-[#AAB9C3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        if (!recognitionRef.current) initSpeechRecognition();
                        recognitionRef.current?.start();
                      }}
                      className={`p-3 rounded-xl transition ${isListening ? 'bg-red-500' : 'bg-[#6DAEDB]'}`}
                      title={t('chat.startVoice')}
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      onClick={() => handleSend(input)}
                      className="p-3 rounded-xl bg-[#6DAEDB] hover:bg-[#4F91C3] text-black transition"
                      title={t('chat.send')}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active chat */
          <>
            <div className="flex-1 px-4 py-4">
              <div
                ref={chatRef}
                className="max-h-[60vh] overflow-y-auto space-y-4 scroll-smooth custom-scroll px-4 py-2"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#6DAEDB] text-black'
                          : 'bg-[#2C3E50] text-[#E0ECF1]'
                      }`}
                    >
                      {' '}
                      {msg.text}{' '}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-700 p-2 sm:p-4 bg-[#1a1a1a]">
              {isTyping && (
                <div className="text-xs text-gray-400 mb-2 ml-1 animate-pulse">
                  Serena está pensando...
                </div>
              )}
              <div className="w-full flex flex-row items-end gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  maxLength={800}
                  placeholder={t('chat.placeholder')}
                  rows={2}
                  className="flex-1 text-base sm:text-sm bg-[#1f2d36] border border-[#2a3b47] text-white placeholder-[#AAB9C3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      if (!recognitionRef.current) initSpeechRecognition();
                      recognitionRef.current?.start();
                    }}
                    className={`p-3 rounded-xl transition ${isListening ? 'bg-red-500' : 'bg-[#6DAEDB]'}`}
                    title={t('chat.startVoice')}
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    onClick={stopNarration}
                    className={`p-3 rounded-xl transition ${isNarrating ? 'bg-yellow-500' : 'bg-gray-700'}`}
                    title="Parar fala"
                  >
                    <Square size={20} />
                  </button>
                  <button
                    onClick={() => handleSend(input)}
                    className="p-3 rounded-xl bg-[#6DAEDB] hover:bg-[#4F91C3] text-black transition"
                    title={t('chat.send')}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Warning */}
        <div className="bg-[#111] text-xs text-gray-400 text-center px-4 py-3 border-t border-gray-800 flex items-center justify-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span>{t('chat.warning')}</span>
        </div>
      </div>
    </div>
  );
};

export default SerenaChat;
