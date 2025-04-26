import React from 'react';
import PageLayout from '../components/PageLayout';
import { useI18n } from '../i18n/I18nContext';
import { User, Shield, Share2, Lock, Mail } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <PageLayout backTo="/">
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full flex flex-col items-center text-center gap-6">
          <Shield size={48} className="text-[#6DAEDB]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#6DAEDB]">{t('privacy.title')}</h1>
          <p className="text-base md:text-lg text-[#AAB9C3] max-w-2xl">{t('privacy.intro')}</p>
        </div>

        <div className="mt-10 max-w-3xl space-y-8 text-sm md:text-base text-[#E0ECF1] leading-relaxed text-left">
          <div className="flex items-start gap-4">
            <User className="min-w-6 min-h-6 text-[#6DAEDB]" />
            <p>{t('privacy.dataCollection')}</p>
          </div>
          <div className="flex items-start gap-4">
            <Shield className="min-w-6 min-h-6 text-[#6DAEDB]" />
            <p>{t('privacy.dataUse')}</p>
          </div>
          <div className="flex items-start gap-4">
            <Share2 className="min-w-6 min-h-6 text-[#6DAEDB]" />
            <p>{t('privacy.sharing')}</p>
          </div>
          <div className="flex items-start gap-4">
            <Lock className="min-w-6 min-h-6 text-[#6DAEDB]" />
            <p>{t('privacy.security')}</p>
          </div>
          <div className="flex items-start gap-4">
            <Mail className="min-w-6 min-h-6 text-[#6DAEDB]" />
            <p>{t('privacy.rights')}</p>
          </div>
          <p className="text-xs text-gray-500 mt-8 text-center">{t('privacy.lastUpdate')}</p>
        </div>
      </main>
    </PageLayout>
  );
};

export default PrivacyPage;
