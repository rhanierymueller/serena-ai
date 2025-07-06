import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { ScrollText, AlertTriangle, FileText, Users, RefreshCw, Shield } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { t } = useI18n();

  const termsItems = [
    {
      icon: AlertTriangle,
      title: t('terms.medicalWarning'),
      content: t('terms.noMedical'),
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: t('terms.privacyTitle'),
      content: t('terms.privacy'),
      color: 'text-green-400',
      bgColor: 'from-green-500 to-teal-500',
    },
    {
      icon: FileText,
      title: t('terms.agreementTitle'),
      content: t('terms.agreement'),
      color: 'text-blue-400',
      bgColor: 'from-blue-500 to-purple-500',
    },
    {
      icon: RefreshCw,
      title: t('terms.changesTitle'),
      content: t('terms.changes'),
      color: 'text-purple-400',
      bgColor: 'from-purple-500 to-pink-500',
    },
  ];
  return (
    <div className="min-h-screen bg-black text-white">
      <Header fixed showMenu />
      <main className="pt-20">
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ScrollText className="h-8 w-8 text-[#6DAEDB]" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                {t('terms.title')}
              </h1>
            </div>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">{t('terms.intro')}</p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {termsItems.map((item, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${item.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors ${item.color}`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-16">
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-[#6DAEDB]" />
                  <h3 className="text-xl font-semibold text-white">{t('terms.commitmentTitle')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="w-10 h-10 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-base font-semibold text-white mb-2">
                      {t('terms.dataProtectedTitle')}
                    </h4>
                    <p className="text-gray-400 text-sm">{t('terms.dataProtectedDescription')}</p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-base font-semibold text-white mb-2">
                      {t('terms.responsibleUseTitle')}
                    </h4>
                    <p className="text-gray-400 text-sm">{t('terms.responsibleUseDescription')}</p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">{t('terms.lastUpdate')}</p>
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

export default TermsPage;
