import React from 'react';
import PageLayout from '../components/PageLayout';
import { useI18n } from '../i18n/I18nContext';
import { Briefcase, Clock } from 'lucide-react';

const ProfessionalArea: React.FC = () => {
  const { t } = useI18n();

  return (
    <PageLayout title={t('professionalArea.title')}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#111] rounded-xl p-8 border border-[#2a3b47]">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#2C3E50] p-3 rounded-xl">
              <Briefcase size={32} className="text-[#6DAEDB]" />
            </div>
            <h1 className="text-2xl font-semibold text-white">{t('professionalArea.title')}</h1>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Clock size={24} className="text-[#6DAEDB] mt-1" />
              <div>
                <h2 className="text-lg font-medium text-white mb-2">
                  {t('professionalArea.inDevelopment')}
                </h2>
                <p className="text-gray-300">{t('professionalArea.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfessionalArea;
