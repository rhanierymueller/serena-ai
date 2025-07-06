import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { Heart, Code, Lightbulb, Target } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-black text-white">
      <Header fixed showMenu />
      <main className="pt-20">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Heart className="h-8 w-8 text-[#6DAEDB]" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                {t('about.title')}
              </h1>
            </div>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">{t('about.subtitle')}</p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-2xl blur opacity-20"></div>
                <img
                  src="/image/profile.webp"
                  alt="Rhaniery Mueller"
                  className="relative w-full max-w-lg mx-auto h-auto object-cover rounded-2xl shadow-xl border border-white/10"
                />
              </div>
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    {t('about.description')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center">
                        <Code className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{t('about.developer')}</h3>
                        <p className="text-sm text-gray-400">{t('about.fullStackAI')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{t('about.mission')}</h3>
                        <p className="text-sm text-gray-400">{t('about.mentalWellness')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{t('about.vision')}</h3>
                        <p className="text-sm text-gray-400">{t('about.healthInnovation')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{t('about.values')}</h3>
                        <p className="text-sm text-gray-400">{t('about.empathyCare')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
