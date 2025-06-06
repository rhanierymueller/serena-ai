import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import ReframeExpress from '../components/ReframeExpress';
import PageLayout from '../components/PageLayout';
import { createChat } from '../services/chatService';
import { sendMessage } from '../services/messageService';
import { generateReply } from '../services/llmService';
import { getUser } from '../services/userSession';

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
    <PageLayout title={t('reframe.title')} backTo="/">
      <div className="w-full max-w-4xl mx-auto">
        <p className="text-[#AAB9C3] text-center mb-12 max-w-2xl mx-auto">
          {t('reframe.description')}
        </p>

        <ReframeExpress
          onChatRedirect={handleChatRedirect}
          onReframeGenerated={handleReframeGenerated}
          isRedirecting={isRedirecting}
        />
      </div>
    </PageLayout>
  );
};

export default ReframeExpressPage;
