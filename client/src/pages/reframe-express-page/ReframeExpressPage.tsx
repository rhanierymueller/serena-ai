import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import ReframeExpress from './components/reframe-express/ReframeExpress';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { createChat } from '../../services/chatService';
import { sendMessage } from '../../services/messageService';
import { generateReply } from '../../services/llmService';
import { getUser } from '../../services/userSession';
import { motion } from 'framer-motion';
import { RefreshCw, Brain, Lightbulb } from 'lucide-react';

const ReframeExpressPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reframeDataRef = useRef<{ thought: string; reframe: string } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleChatRedirect = async () => {
    setIsRedirecting(true);
    try {
      if (reframeDataRef.current) {
        const userId = getUser()?.id ?? null;
        const newChat = await createChat(userId);

        const { thought, reframe } = reframeDataRef.current;
        const contextMessage = `${t('reframe.chatContext')}\n\nPensamento original: "${thought}"\n\nReestruturação: "${reframe}"`;

        await sendMessage(newChat.id, 'user', contextMessage);

        try {
          await generateReply(newChat.id);
        } catch (replyError) {
          console.error('Erro ao gerar resposta automática:', replyError);
        }

        navigate(`/chat?id=${newChat.id}`);
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Erro ao criar chat com contexto:', error);
      navigate('/chat');
    }
  };

  const handleReframeGenerated = (thought: string, reframe: string) => {
    reframeDataRef.current = { thought, reframe };
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={t('reframe.title')} backTo="/" fixed /><div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/5 via-transparent to-[#4F91C3]/5" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#6DAEDB]/10 to-[#4F91C3]/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-[#4F91C3]/10 to-[#6DAEDB]/10 rounded-full blur-xl animate-pulse" />
      </div><div className="relative z-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 py-8"><motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Brain size={48} className="text-[#6DAEDB] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 rounded-full blur-2xl"></div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-6">
              {t('reframe.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#AAB9C3] max-w-4xl mx-auto leading-relaxed mb-8">
              {t('reframe.description')}
            </p><div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#6DAEDB]/10 to-[#4F91C3]/10 px-4 py-2 rounded-full border border-[#6DAEDB]/20">
                <RefreshCw size={16} className="text-[#6DAEDB]" />
                <span className="text-[#E0ECF1]">Terapia Cognitivo-Comportamental</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#4F91C3]/10 to-[#6DAEDB]/10 px-4 py-2 rounded-full border border-[#4F91C3]/20">
                <Lightbulb size={16} className="text-[#4F91C3]" />
                <span className="text-[#E0ECF1]">Transformação em 60 segundos</span>
              </div>
            </div>
          </motion.div><motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-12"
          >
            <ReframeExpress
              onChatRedirect={handleChatRedirect}
              onReframeGenerated={handleReframeGenerated}
              isRedirecting={isRedirecting}
            />
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReframeExpressPage;