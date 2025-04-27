import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { resendActivationEmail } from '../../services/userService';
import { Loader2 } from 'lucide-react';

interface EmailVerificationModalProps {
  email: string;
  onClose: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ email, onClose }) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [counter, setCounter] = useState(59);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResend = async () => {
    try {
      setIsLoading(true);
      await resendActivationEmail(email);
      showToast(t('activationEmail.resentSuccess'), 'success');
      setCounter(59);
      setCanResend(false);

      const newTimer = setInterval(() => {
        setCounter(prev => {
          if (prev <= 1) {
            clearInterval(newTimer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao reenviar:', error);
      showToast(error.message || t('errors.internalServerError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={t('activationEmail.title')}
      description={
        <div className="space-y-4">
          <p>{t('activationEmail.text', { email })}</p>
          {!canResend && (
            <p className="text-sm text-gray-400">
              {t('activationEmail.resendIn', { seconds: counter })}
            </p>
          )}
        </div>
      }
      onCancel={onClose}
      onConfirm={handleResend}
      cancelText={t('activationEmail.close')}
      confirmText={
        isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin w-4 h-4" />
            {t('activationEmail.resendButton')}
          </div>
        ) : (
          t('activationEmail.resendButton')
        )
      }
      confirmDisabled={!canResend || isLoading}
      size="sm"
    />
  );
};

export default EmailVerificationModal;
