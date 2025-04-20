import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import PageLayout from '../components/PageLayout';
import { ScrollText } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <PageLayout backTo="/">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full flex flex-col items-center text-center gap-6">
          <ScrollText size={48} className="text-[#6DAEDB]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#6DAEDB]">{t('terms.title')}</h1>
          <p className="text-base md:text-lg text-[#AAB9C3] max-w-2xl">{t('terms.intro')}</p>
        </div>

        <div className="mt-10 max-w-3xl space-y-6 text-sm md:text-base text-[#E0ECF1] leading-relaxed">
          <p>{t('terms.noMedical')}</p>
          <p>{t('terms.privacy')}</p>
          <p>{t('terms.agreement')}</p>
          <p>{t('terms.changes')}</p>
          <p className="text-xs text-gray-500 mt-8 text-center">{t('terms.lastUpdate')}</p>
        </div>
      </main>
    </PageLayout>
  );
};

export default TermsPage;
