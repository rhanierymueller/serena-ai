import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, AlertTriangle, LogOut, Square } from 'lucide-react';
import LogoIcon from '/image/image.png';
import ChatSidebar from '../components/ChatSidebar';
import { useI18n } from '../i18n/I18nContext';
import { createChat, getChats } from '../services/chatService';
import { getMessages, sendMessage } from '../services/messageService';
import { getUser } from '../services/userSession';
import { checkAuth, fetchUserProfile } from '../services/userService';
import { generateReply } from '../services/llmService';
import { useUserTokens } from '../hooks/useUserTokens';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BASE_URL } from '../config';

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
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-white">
      <div className="hidden sm:block">
        <ChatSidebar
          currentChatId={chatId}
          onSelectChat={id => setChatId(id)}
          onCreateNew={() => setMessages([])}
        />
      </div>

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

      <div className="flex-1 flex flex-col">
        <div className="sm:hidden px-4 pt-2">
          <button
            onClick={() => setShowSidebarMobile(true)}
            className="text-white bg-[#6DAEDB] px-3 py-2 rounded-xl"
          >
            ☰ {t('sidebar.menu')}
          </button>
        </div>

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

        {plan === 'pro' && (
          <div className="px-4 mt-2">
            <div className="flex items-center gap-2 text-xs bg-[#1f2d36] border border-[#2a3b47] text-[#AAB9C3] rounded-xl px-3 py-2 w-fit shadow-sm">
              <span className="font-medium">{t('chat.tokensRemaining')}:</span>
              <span className="text-white font-bold">{total - used}</span>
              <span className="text-[#AAB9C3]">/ {total}</span>
            </div>
          </div>
        )}

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="flex items-center gap-3 mb-8">
              <img
                src={LogoIcon}
                alt="Avylia logo"
                className="h-12 w-12 md:h-14 md:w-14 select-none pointer-events-none"
              />
              <h1 className="text-3xl md:text-4xl font-bold font-sans" style={{ color: '#6DAEDB' }}>
                Avylia <span className="text-white/80">AI</span>
              </h1>
            </div>
            <div className="w-full max-w-lg">
              <div className="border border-gray-700 rounded-2xl bg-[#1a1a1a] p-4">
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
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-700 p-2 sm:p-4 bg-[#1a1a1a]">
              {isTyping && (
                <div className="text-xs text-gray-400 mb-2 ml-1 animate-pulse">
                  {t('chat.typing')}
                </div>
              )}
              <div className="w-full flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
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

                <div className="flex flex-row justify-between sm:justify-start sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex flex-row gap-2">
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
                  </div>

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

        <div className="bg-[#111] text-xs text-gray-400 text-center px-4 py-3 border-t border-gray-800 flex items-center justify-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span>{t('chat.warning')}</span>
        </div>
      </div>
    </div>
  );
};

export default AvyliaChat;
