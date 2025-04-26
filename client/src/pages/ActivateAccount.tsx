import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const ActivateAccount: React.FC = () => {
  const { token } = useParams();
  const { t } = useI18n();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const activate = async () => {
      try {
        const response = await fetch(`/api/activate/${token}`);
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    if (token) {
      activate();
    }
  }, [token]);

  return (
    <PageLayout backTo="/">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full flex flex-col items-center text-center gap-6">
          {status === 'loading' && (
            <>
              <Loader2 size={48} className="animate-spin text-[#6DAEDB]" />
              <h1 className="text-2xl md:text-3xl font-bold text-[#6DAEDB]">
                {t('activation.loadingTitle')}
              </h1>
              <p className="text-base md:text-lg text-[#AAB9C3]">{t('activation.loadingText')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={48} className="text-[#6DAEDB]" />
              <h1 className="text-2xl md:text-3xl font-bold text-[#6DAEDB]">
                {t('activation.successTitle')}
              </h1>
              <p className="text-base md:text-lg text-[#AAB9C3]">{t('activation.successText')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={48} className="text-red-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-red-500">
                {t('activation.errorTitle')}
              </h1>
              <p className="text-base md:text-lg text-[#AAB9C3]">{t('activation.errorText')}</p>
            </>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default ActivateAccount;
