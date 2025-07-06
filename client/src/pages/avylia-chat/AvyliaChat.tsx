import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, AlertTriangle, LogOut, Square, Sparkles, Zap } from 'lucide-react';
import LogoIcon from '/image/image.png';
import ChatSidebar from './components/chat-sidebar/ChatSidebar';
import QuestionSuggestions from './components/question-suggestions/QuestionSuggestions';
import { useI18n } from '../../i18n/I18nContext';
import { createChat, getChats } from '../../services/chatService';
import { getMessages, sendMessage } from '../../services/messageService';
import { getUser } from '../../services/userSession';
import { checkAuth, fetchUserProfile } from '../../services/userService';
import { generateReply } from '../../services/llmService';
import { useUserTokens } from '../../hooks/useUserTokens';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { BASE_URL } from '../../config';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const AvyliaChat: React.FC = () => {
  const { t, language } = useI18n();
  const { total, used, refetchTokens } = useUserTokens();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState<'pro' | 'free'>('free');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const checkoutProcessedRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const removeEmojis = (text: string) =>
    text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/gu, '');

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
    setIsTyping(true);
    try {
      const botReply = await generateReply(chatId);
      const botMsg: Message = { sender: 'bot', text: botReply.content };
      setMessages(prev => [...prev, botMsg]);
      await refetchTokens();
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
    const processCheckoutSuccess = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const checkoutSuccess = params.get('checkout_success') === 'true';
        const sessionId = params.get('session_id');

        if (checkoutSuccess && !checkoutProcessedRef.current) {
          checkoutProcessedRef.current = true;
          let tokenAmount;

          if (sessionId) {
            try {
              const sessionResponse = await fetch(`${BASE_URL}/api/stripe/session/${sessionId}`);
              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                if (sessionData.tokenAmount) {
                  tokenAmount = Number(sessionData.tokenAmount);
                }
              }
            } catch (error) {
              console.error('❌ Erro ao obter informações da sessão:', error);
            }
          }
          try {
            const response = await fetch(`${BASE_URL}/api/users/update-plan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                userId: getUser()?.id,
                plan: 'pro',
                tokenAmount: tokenAmount,
              }),
            });

            if (response.ok) {
              await refreshUser();
              const updatedUser = await checkAuth();
              setPlan('pro');
              await refetchTokens();
            } else {
              console.error('❌ Falha ao atualizar o plano manualmente');
            }
          } catch (error) {
            console.error('❌ Erro ao atualizar o plano manualmente:', error);
          }

          navigate('/chat', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao processar checkout:', error);
      }
    };

    processCheckoutSuccess();
  }, [location.search, navigate, refreshUser, refetchTokens]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const user = await checkAuth();
        if (user?.plan) setPlan(user.plan);

        const params = new URLSearchParams(location.search);
        const chatIdFromUrl = params.get('id');

        if (chatIdFromUrl) {
          try {
            setChatId(chatIdFromUrl);
            const msgs = await getMessages(chatIdFromUrl);
            setMessages(
              msgs.map((m: { role: string; content: any }) => ({
                sender: m.role === 'user' ? 'user' : 'bot',
                text: m.content,
              }))
            );
            return;
          } catch (chatError) {
            console.error('Erro ao carregar chat específico:', chatError);
          }
        }

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
      } catch (error) {
        console.error('Erro ao inicializar chat:', error);
      }
    };

    initChat();
  }, [location.search]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;

      try {
        const msgs = await getMessages(chatId);
        setMessages(
          msgs.map((m: { role: string; content: any }) => ({
            sender: m.role === 'user' ? 'user' : 'bot',
            text: m.content,
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    loadMessages();
  }, [chatId]);

  const isEmpty = messages.length === 0;
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#111111] text-white relative">
      <div className="hidden sm:block">
        <ChatSidebar
          currentChatId={chatId}
          onSelectChat={id => setChatId(id)}
          onCreateNew={async () => {
            try {
              const user = await checkAuth();
              const userId = user?.id ?? null;
              const newChat = await createChat(userId);
              setChatId(newChat.id);
              setMessages([]);
            } catch (err) {
              console.error('Erro ao criar novo chat:', err);
            }
          }}
          onDeleteChat={async () => {
            try {
              setMessages([]);
              const user = await checkAuth();
              const userId = user?.id ?? null;
              const chats = await getChats(userId);

              if (chats.length > 0) {
                setChatId(chats[0].id);
              } else {
                const newChat = await createChat(userId);
                setChatId(newChat.id);
              }
            } catch (err) {
              console.error('Erro ao processar exclusão de chat:', err);
            }
          }}
        />
      </div>

      {showSidebarMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex">
          <div className="w-64 bg-gradient-to-b from-[#111] to-[#1a1a1a] flex flex-col h-full">
            <ChatSidebar
              currentChatId={chatId}
              onSelectChat={id => {
                setChatId(id);
                setShowSidebarMobile(false);
              }}
              onCreateNew={async () => {
                try {
                  const user = await checkAuth();
                  const userId = user?.id ?? null;
                  const newChat = await createChat(userId);
                  setChatId(newChat.id);
                  setMessages([]);
                  setShowSidebarMobile(false);
                } catch (err) {
                  console.error('Erro ao criar novo chat:', err);
                }
              }}
              onDeleteChat={async () => {
                try {
                  setMessages([]);

                  const user = await checkAuth();
                  const userId = user?.id ?? null;
                  const chats = await getChats(userId);

                  if (chats.length > 0) {
                    setChatId(chats[0].id);
                  } else {
                    const newChat = await createChat(userId);
                    setChatId(newChat.id);
                  }
                  setShowSidebarMobile(false);
                } catch (err) {
                  console.error('Erro ao processar exclusão de chat:', err);
                }
              }}
              onCloseMobileSidebar={() => setShowSidebarMobile(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setShowSidebarMobile(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="sm:hidden px-4 pt-4 pb-2">
          <button
            onClick={() => setShowSidebarMobile(true)}
            className="text-white bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] px-4 py-2 rounded-xl hover:from-[#4F91C3] hover:to-[#3A7A9F] transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            ☰ {t('sidebar.menu')}
          </button>
        </div>
        <div className="px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl font-medium transition-all duration-300 ${
                plan === 'pro'
                  ? 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-black shadow-lg'
                  : 'bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white border border-white/10'
              }`}
            >
              {plan === 'pro' ? <Sparkles size={14} /> : <Zap size={14} />}
              <span>
                {t('chat.planLabel')}: {t(`chat.plan.${plan}`)}
              </span>
            </div>
          </div>

          {plan === 'pro' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-xs bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/20 text-[#AAB9C3] rounded-xl px-4 py-2 shadow-lg">
                <Zap size={14} className="text-[#6DAEDB]" />
                <span className="font-medium">{t('chat.tokensRemaining')}:</span>
                <div className="flex items-center gap-1">
                  <span className="text-white font-bold text-sm">{total - used}</span>
                  <span className="text-[#AAB9C3]">/ {total}</span>
                </div>
                <div className="w-16 bg-[#2C3E50] rounded-full h-1.5 ml-2">
                  <div
                    className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((total - used) / total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="flex items-center gap-4 mb-8 animate-pulse">
              <div className="relative">
                <img
                  src={LogoIcon}
                  alt="Avylia logo"
                  className="h-16 w-16 md:h-20 md:w-20 select-none pointer-events-none drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/20 to-[#4F91C3]/20 rounded-full blur-lg"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6DAEDB] via-[#4F91C3] to-[#3A7A9F] bg-clip-text text-transparent">
                Avylia <span className="text-white/80">AI</span>
              </h1>
            </div>
            <div className="w-full max-w-4xl mb-8">
              <QuestionSuggestions onSelectQuestion={question => handleSend(question)} />
            </div>
            <div className="w-full max-w-2xl">
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#6DAEDB]/20 rounded-3xl p-6 shadow-2xl">
                <div className="w-full flex flex-col sm:flex-row items-end gap-3">
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
                    className="flex-1 text-base bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-[#AAB9C3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent resize-none transition-all duration-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!recognitionRef.current) initSpeechRecognition();
                        recognitionRef.current?.start();
                      }}
                      className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        isListening
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-black hover:from-[#4F91C3] hover:to-[#3A7A9F]'
                      }`}
                      title={t('chat.startVoice')}
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      onClick={() => handleSend(input)}
                      className="p-3 rounded-xl bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-black transition-all duration-300 transform hover:scale-105 shadow-lg"
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
          <>
            <div className="flex-1 px-4 py-4">
              <div
                ref={chatRef}
                className="max-h-[60vh] overflow-y-auto space-y-4 scroll-smooth custom-scroll px-2 py-2"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line shadow-lg transition-all duration-300 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-black border border-[#6DAEDB]/20'
                          : 'bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-[#E0ECF1] border border-white/10'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-[#E0ECF1] border border-white/10 px-4 py-3 rounded-2xl shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-[#6DAEDB] rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-[#4F91C3] rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-[#3A7A9F] rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                        <span className="text-xs">{t('chat.typing')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-[#6DAEDB]/20 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
              <div className="w-full flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
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
                  className="flex-1 text-base bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-[#AAB9C3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent resize-none transition-all duration-300"
                />
                <div className="flex justify-between sm:justify-start gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!recognitionRef.current) initSpeechRecognition();
                        recognitionRef.current?.start();
                      }}
                      className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        isListening
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-black hover:from-[#4F91C3] hover:to-[#3A7A9F]'
                      }`}
                      title={t('chat.startVoice')}
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      onClick={stopNarration}
                      className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        isNarrating
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black animate-pulse'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600'
                      }`}
                      title={t('chat.stopSpeech')}
                    >
                      <Square size={20} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSend(input)}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-black transition-all duration-300 transform hover:scale-105 shadow-lg"
                    title={t('chat.send')}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="bg-gradient-to-r from-[#111] to-[#1a1a1a] text-xs text-gray-400 text-center px-4 py-3 border-t border-[#6DAEDB]/20 flex items-center justify-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span>{t('chat.warning')}</span>
        </div>
      </div>
    </div>
  );
};

export default AvyliaChat;
