import React from 'react';
import PageLayout from '../components/PageLayout';
import { useI18n } from '../i18n/I18nContext';

const TermsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <PageLayout title={t('terms.title')} backTo="/">
      <div className="max-w-3xl mx-auto text-sm text-gray-300 space-y-6 leading-relaxed">
        <p>{t('terms.intro')}</p>
        <p>{t('terms.noMedical')}</p>
        <p>{t('terms.privacy')}</p>
        <p>{t('terms.agreement')}</p>
        <p>{t('terms.changes')}</p>
        <p className="text-xs text-gray-500">{t('terms.lastUpdate')}</p>
      </div>
    </PageLayout>
  );
};

export default TermsPage;
