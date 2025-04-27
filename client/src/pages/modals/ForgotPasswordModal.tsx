import React, { useState } from 'react';
import Modal from '../../components/Modal';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../context/ToastContext';
import { BASE_URL } from '../../config';

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    try {
      setIsSending(true);
      const res = await fetch(`${BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Erro ao enviar e-mail.');

      showToast(t('login.emailSent'), 'success');
      onClose();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Erro interno.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      title={t('login.forgotPasswordTitle')}
      description={
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
          />
        </div>
      }
      onCancel={onClose}
      onConfirm={handleSend}
      confirmDisabled={!email || isSending}
      confirmText={isSending ? 'Enviando...' : t('login.send')}
      cancelText={t('register.cancel')}
      size="sm"
    />
  );
};

export default ForgotPasswordModal;
