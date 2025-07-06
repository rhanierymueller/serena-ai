import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useI18n } from '../../i18n/I18nContext';
import { User, Shield, Share2, Lock, Mail, Eye, Database } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const { t } = useI18n();

  const privacyItems = [
    {
      icon: User,
      title: t('privacy.dataCollectionTitle'),
      content: t('privacy.dataCollection'),
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      icon: Shield,
      title: t('privacy.dataUseTitle'),
      content: t('privacy.dataUse'),
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: Share2,
      title: t('privacy.sharingTitle'),
      content: t('privacy.sharing'),
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Lock,
      title: t('privacy.securityTitle'),
      content: t('privacy.security'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Mail,
      title: t('privacy.rightsTitle'),
      content: t('privacy.rights'),
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Database,
      title: t('privacy.storageTitle'),
      content: t('privacy.storage'),
      gradient: 'from-indigo-500 to-violet-500',
    },
  ];
  return (
    <div className="min-h-screen bg-black text-white">
      <Header fixed showMenu />
      <main className="pt-20">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-[#6DAEDB]" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                {t('privacy.title')}
              </h1>
            </div>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">{t('privacy.intro')}</p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {privacyItems.map((item, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-[#6DAEDB] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Eye className="h-6 w-6 text-[#6DAEDB]" />
                  <h3 className="text-xl font-semibold text-white">
                    {t('privacy.transparencyTitle')}
                  </h3>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  {t('privacy.transparencyDescription')}
                </p>
                <p className="text-sm text-gray-500">{t('privacy.lastUpdate')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
