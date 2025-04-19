import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import PageLayout from '../components/PageLayout';

const About: React.FC = () => {
  const { t } = useI18n();
  return (
    <PageLayout backTo="/">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center md:justify-center gap-10 min-h-[60vh]">
          <img
            src="/image/profile.webp"
            alt="Rhaniery Mueller"
            className="w-60 h-60 object-cover rounded-2xl shadow-lg border-2 border-[#6DAEDB]"
          />
          <div className="text-left max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#6DAEDB] mb-4">
              {t('about.title')}
            </h2>
            <p className="text-lg md:text-xl text-[#AAB9C3] leading-relaxed">
              {t('about.description')}
            </p>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default About;
