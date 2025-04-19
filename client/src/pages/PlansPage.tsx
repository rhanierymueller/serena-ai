import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import PageLayout from '../components/PageLayout';
import { getUser } from '../services/userSession';
import { handleStripeSubscriptionCheckout } from '../hooks/useStripeCheckout';

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const user = getUser();
  const isPro = user?.plan === 'pro';

  const handleProCheckout = () => {
    if (!user?.id || !user?.email) {
      alert('Você precisa estar logado para assinar.');
      return;
    }

    handleStripeSubscriptionCheckout(user.id, user.email);
  };

  return (
    <PageLayout title="Planos disponíveis" backTo="/">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{t('plansPage.title')}</h1>
        <p className="text-gray-400 mb-10">{t('plansPage.subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{t('plansPage.free.title')}</h2>
            <p className="text-gray-400 mb-4">{t('plansPage.free.description')}</p>
            <span className="block text-2xl font-bold mb-4">{t('plansPage.free.price')}</span>
            <button
              onClick={() => navigate('/')}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl font-semibold transition"
            >
              {t('plansPage.free.button')}
            </button>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#6DAEDB] shadow-md">
            <h2 className="text-2xl font-semibold mb-2">{t('plansPage.pro.title')}</h2>
            <p className="text-gray-400 mb-4">{t('plansPage.pro.description')}</p>
            <span className="block text-2xl font-bold mb-4">{t('plansPage.pro.price')}</span>

            <button
              onClick={() => {
                if (!isPro) {
                  handleProCheckout();
                }
              }}
              disabled={isPro}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                isPro
                  ? 'bg-gray-600 text-white cursor-not-allowed'
                  : 'bg-[#6DAEDB] hover:bg-[#4F91C3] text-black'
              }`}
            >
              {isPro ? 'Você já é assinante PRO' : t('plansPage.pro.button')}
            </button>

            {isPro && (
              <p className="text-sm text-green-400 mt-2">
                {t('plansPage.thanks-for-the-suport')} 💙
              </p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PlansPage;
