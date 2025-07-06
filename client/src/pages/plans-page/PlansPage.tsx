import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { getUser } from '../../services/userSession';
import { fetchUserProfile, checkAuth } from '../../services/userService';
import { handleStripeSubscriptionCheckout } from '../../hooks/useStripeCheckout';
import { useUserTokens } from '../../hooks/useUserTokens';
import { Gem, Zap, Star, Shield, Heart, MessageCircle, Wind } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { getPublicConfig } from '../../services/configService';

const PlansPage: React.FC = () => {
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const { total, used } = useUserTokens();
  const [plans, setPlans] = useState<
    { tokens: number; price: string; priceUsd: number; priceBrl: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const config = await getPublicConfig();

        const formattedPlans = config.plans.map(plan => {
          const priceToShow = language === 'pt' ? plan.priceBrl : plan.priceUsd;
          return {
            tokens: plan.tokens,
            price: formatPrice(priceToShow, language),
            priceUsd: plan.priceUsd,
            priceBrl: plan.priceBrl,
          };
        });

        setPlans(formattedPlans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        const defaultPriceUsd2k = 9.99;
        const defaultPriceUsd5k = 19.99;
        const defaultPriceUsd10k = 29.99;
        const defaultPriceBrl2k = 49.9;
        const defaultPriceBrl5k = 99.0;
        const defaultPriceBrl10k = 149.9;
        const priceToShow2k = language === 'pt' ? defaultPriceBrl2k : defaultPriceUsd2k;
        const priceToShow5k = language === 'pt' ? defaultPriceBrl5k : defaultPriceUsd5k;
        const priceToShow10k = language === 'pt' ? defaultPriceBrl10k : defaultPriceUsd10k;
        setPlans([
          {
            tokens: 2000,
            price: formatPrice(priceToShow2k, language),
            priceUsd: defaultPriceUsd2k,
            priceBrl: defaultPriceBrl2k,
          },
          {
            tokens: 5000,
            price: formatPrice(priceToShow5k, language),
            priceUsd: defaultPriceUsd5k,
            priceBrl: defaultPriceBrl5k,
          },
          {
            tokens: 10000,
            price: formatPrice(priceToShow10k, language),
            priceUsd: defaultPriceUsd10k,
            priceBrl: defaultPriceBrl10k,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [language]);

  const handleCheckout = (tokenAmount: number) => {
    if (!user?.id || !user?.email) {
      alert(t('plansPage.loginRequired'));
      return;
    }
    handleStripeSubscriptionCheckout(user.id, user.email, tokenAmount, language);
  };

  const tokensLeft = total - used;
  return (
    <div className="min-h-screen bg-black text-white">
      <Header fixed showMenu />
      <main className="pt-20 pb-20">
        {}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Gem className="h-8 w-8 text-[#6DAEDB]" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                {t('plansPage.title')}
              </h1>
            </div>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              {t('plansPage.subtitle')}
            </p>

            {}
            <div className="mb-12 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 p-6 rounded-2xl max-w-lg mx-auto">
              <h3 className="text-xl font-semibold mb-3 text-[#6DAEDB]">
                {t('plansPage.currentPlan')}
              </h3>

              {user?.plan === 'pro' ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">
                    {t('plansPage.subscriptionPlan')} ({t('plansPage.tokenBased')})
                  </span>
                </div>
              ) : total > 0 ? (
                <div className="space-y-2">
                  <p className="text-gray-300">
                    {t('plansPage.youHave')}{' '}
                    <span className="font-bold text-[#6DAEDB]">{tokensLeft}</span>{' '}
                    {t('plansPage.tokensLeft')}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(tokensLeft / total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    {total} {t('plansPage.tokens')} total
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Shield className="h-5 w-5" />
                  <span>{t('plansPage.freePlan')}</span>
                </div>
              )}
            </div>
          </div>
        </section><section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DAEDB] mx-auto mb-4"></div>
                <p className="text-gray-400">{t('common.loading')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <div
                    key={plan.tokens}
                    className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                      index === 1
                        ? 'border-[#6DAEDB] bg-gradient-to-br from-[#6DAEDB]/10 to-[#4F91C3]/10'
                        : 'border-white/10 bg-gradient-to-br from-gray-900/50 to-gray-800/50'
                    }`}
                  >
                    {index === 1 && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] text-white text-sm font-semibold text-center py-2">
                        Mais Popular
                      </div>
                    )}

                    <div className={`p-8 ${index === 1 ? 'pt-12' : ''}`}>
                      <div className="text-center mb-6">
                        <Zap className="h-12 w-12 text-[#6DAEDB] mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2 text-white">
                          {plan.tokens.toLocaleString()} {t('plansPage.tokens')}
                        </h3>
                        <p className="text-gray-400">
                          {t('plansPage.validFor')} {t('plansPage.tokenBasedUsage')}
                        </p>
                      </div>
                      <div className="text-center mb-8">
                        <span className="text-4xl font-bold text-[#6DAEDB]">{plan.price}</span>
                      </div>
                      <button
                        onClick={() => handleCheckout(plan.tokens)}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                          index === 1
                            ? 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white shadow-lg'
                            : 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white'
                        }`}
                      >
                        {t('plansPage.buyNow')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section><section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                {t('plansPage.benefitsTitle')}
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Descubra todas as funcionalidades incluídas em nossos planos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wind className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {t('plansPage.benefits.breathingTitle')}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('plansPage.benefits.breathingDesc')}
                </p>
              </div>
              <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {t('plansPage.benefits.journalTitle')}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {t('plansPage.benefits.journalDesc')}
                </p>
              </div>
              <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {t('plansPage.benefits.chatTitle')}
                </h3>
                <p className="text-gray-400 leading-relaxed">{t('plansPage.benefits.chatDesc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PlansPage;