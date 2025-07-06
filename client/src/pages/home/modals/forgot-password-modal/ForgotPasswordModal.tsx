import React, { useState } from 'react';
import Modal from '../../../../components/modal/Modal';
import { useI18n } from '../../../../i18n/I18nContext';
import { useToast } from '../../../../context/ToastContext';
import { BASE_URL } from '../../../../config';

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
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">
              {t('login.email')}
            </label>
            <input
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
            />
          </div>
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