import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import PageLayout from '../components/PageLayout';
import { getUser } from '../services/userSession';
import { handleStripeSubscriptionCheckout } from '../hooks/useStripeCheckout';
import { useUserTokens } from '../hooks/useUserTokens';
import { Gem } from 'lucide-react';

const PlansPage: React.FC = () => {
  const { t } = useI18n();
  const user = getUser();
  const { total, used } = useUserTokens();

  const handleCheckout = (tokenAmount: number) => {
    if (!user?.id || !user?.email) {
      alert(t('plansPage.loginRequired'));
      return;
    }
    handleStripeSubscriptionCheckout(user.id, user.email, tokenAmount);
  };

  const plans = [
    { tokens: 2000, price: 'R$ 49,90' },
    { tokens: 5000, price: 'R$ 99,00' },
    { tokens: 10000, price: 'R$ 149,90' },
  ];

  const tokensLeft = total - used;

  return (
    <PageLayout backTo="/">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{t('plansPage.title')}</h1>
        <p className="text-gray-400 mb-10">{t('plansPage.subtitle')}</p>

        <div className="mb-10 bg-[#111] text-white border border-gray-700 p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-1">{t('plansPage.currentPlan')}</h3>

          {user?.plan === 'pro' ? (
            <p className="text-sm text-green-400 flex items-center justify-center gap-2">
              <Gem size={16} className="text-[#6DAEDB]" />
              <span>
                {t('plansPage.subscriptionPlan')} ({t('plansPage.tokenBased')})
              </span>
            </p>
          ) : total > 0 ? (
            <p className="text-sm text-[#AAB9C3]">
              {t('plansPage.youHave')} <strong>{tokensLeft}</strong> {t('plansPage.tokensLeft')} (
              {total} {t('plansPage.tokens')} total)
            </p>
          ) : (
            <p className="text-sm text-[#AAB9C3]">{t('plansPage.freePlan')}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.tokens}
              className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#6DAEDB] shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {plan.tokens} {t('plansPage.tokens')}
              </h2>
              <p className="text-gray-400 mb-4">
                {t('plansPage.validFor')} {t('plansPage.tokenBasedUsage')}
              </p>
              <span className="block text-2xl font-bold mb-4">{plan.price}</span>
              <button
                onClick={() => handleCheckout(plan.tokens)}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-4 py-2 rounded-xl font-semibold transition"
              >
                {t('plansPage.buyNow')}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-left text-white max-w-4xl mx-auto space-y-10">
          <h2 className="text-2xl font-bold text-[#6DAEDB] mb-2">{t('plansPage.benefitsTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#2a3b47] shadow text-center">
              <h3 className="text-lg font-semibold text-[#6DAEDB] mb-2">
                {t('plansPage.benefits.breathingTitle')}
              </h3>
              <p className="text-sm text-[#AAB9C3]">{t('plansPage.benefits.breathingDesc')}</p>
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#2a3b47] shadow text-center">
              <h3 className="text-lg font-semibold text-[#6DAEDB] mb-2">
                {t('plansPage.benefits.journalTitle')}
              </h3>
              <p className="text-sm text-[#AAB9C3]">{t('plansPage.benefits.journalDesc')}</p>
            </div>

            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#2a3b47] shadow text-center">
              <h3 className="text-lg font-semibold text-[#6DAEDB] mb-2">
                {t('plansPage.benefits.chatTitle')}
              </h3>
              <p className="text-sm text-[#AAB9C3]">{t('plansPage.benefits.chatDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PlansPage;
