import React, { useEffect, useState } from 'react';
import { getUser, saveUser } from '../services/userSession';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { BASE_URL } from '../config';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from '../context/ToastContext';
import { useUserTokens } from '../hooks/useUserTokens';
import Modal from '../components/Modal';
import { formatPrice } from '../utils/formatters';
import { getPublicConfig } from '../services/configService';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { total, used } = useUserTokens();
  const [plans, setPlans] = useState<{ tokens: number; price: string }[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [activeTab, setActiveTab] = useState<'info' | 'test'>('info');
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t, language } = useI18n();
  const { showToast } = useToast();

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const config = await getPublicConfig();

        // Formata os preços de acordo com o idioma
        const formattedPlans = config.plans.map(plan => {
          // Usa o preço em BRL para português e USD para outros idiomas
          const priceToShow = language === 'pt' ? plan.priceBrl : plan.priceUsd;
          return {
            tokens: plan.tokens,
            price: formatPrice(priceToShow, language),
          };
        });

        setPlans(formattedPlans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        // Fallback para valores padrão em caso de erro
        const defaultPriceUsd2k = 9.99;
        const defaultPriceUsd5k = 19.99;
        const defaultPriceUsd10k = 29.99;
        const defaultPriceBrl2k = 49.9;
        const defaultPriceBrl5k = 99.0;
        const defaultPriceBrl10k = 149.9;

        // Usa o preço em BRL para português e USD para outros idiomas
        const priceToShow2k = language === 'pt' ? defaultPriceBrl2k : defaultPriceUsd2k;
        const priceToShow5k = language === 'pt' ? defaultPriceBrl5k : defaultPriceUsd5k;
        const priceToShow10k = language === 'pt' ? defaultPriceBrl10k : defaultPriceUsd10k;

        setPlans([
          { tokens: 2000, price: formatPrice(priceToShow2k, language) },
          { tokens: 5000, price: formatPrice(priceToShow5k, language) },
          { tokens: 10000, price: formatPrice(priceToShow10k, language) },
        ]);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, [language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      console.error('Usuário inválido para exclusão.');
      return;
    }
    try {
      await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      saveUser(null);
      showToast(t('profile.accountDeletedSuccess'), 'success');
      navigate('/');
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      showToast(t('errors.internalServerError'), 'error');
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      console.error('Usuário inválido para atualização.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      const updated = await res.json();
      saveUser(updated);
      setUser(updated);
      showToast(t('profile.saveChangesSuccess'), 'success');
      navigate('/');
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      showToast(t('errors.internalServerError'), 'error');
    }
  };

  if (loading || !user) return <div className="text-white p-4">{t('profile.loading')}</div>;

  return (
    <PageLayout title={t('profile.title')} backTo="/">
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-black/80 p-6 sm:p-8 rounded-2xl border border-gray-700 max-w-2xl shadow-lg w-full">
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-3 font-medium ${
                activeTab === 'info'
                  ? 'text-[#6DAEDB] border-b-2 border-[#6DAEDB]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('profile.infoTab')}
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`pb-2 px-3 font-medium ${
                activeTab === 'test'
                  ? 'text-[#6DAEDB] border-b-2 border-[#6DAEDB]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('profile.planTab')}
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1">{t('profile.name')}</label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
                />
              </div>
              <div>
                <label className="block mb-1">{t('profile.email')}</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block mb-1">{t('profile.gender')}</label>
                <select
                  name="gender"
                  value={user.gender || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
                >
                  <option value="">{t('profile.genderOptions.select')}</option>
                  <option value="male">{t('profile.genderOptions.male')}</option>
                  <option value="female">{t('profile.genderOptions.female')}</option>
                  <option value="other">{t('profile.genderOptions.other')}</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">{t('profile.plan')}</label>
                <input
                  type="text"
                  name="plan"
                  value={user.plan}
                  disabled
                  className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
                />
              </div>
              <button
                onClick={handleSave}
                className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-xl font-semibold transition-all w-full"
              >
                {t('profile.saveChanges')}
              </button>
              <div className="text-center">
                <p
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-500 hover:text-red-400 underline text-sm cursor-pointer"
                >
                  {t('profile.deleteAccount')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="text-gray-300">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-[#6DAEDB] mb-2">
                  {t('profile.plans.thanks-for-the-suport')}
                </h3>
                <p className="text-sm text-[#AAB9C3]">
                  {t('plansPage.youHave')} <strong>{total - used}</strong>{' '}
                  {t('plansPage.tokensLeft')} ({total} {t('plansPage.tokens')}{' '}
                  {t('plansPage.validFor')})
                </p>
              </div>

              {loadingPlans ? (
                <div className="text-center py-10">
                  <p>{t('common.loading')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(plan => (
                    <div
                      key={plan.tokens}
                      className="p-6 rounded-2xl border border-[#6DAEDB] bg-[#1a1a1a] text-center shadow-md"
                    >
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {plan.tokens} {t('plansPage.tokens')}
                      </h3>
                      <p className="text-[#AAB9C3] text-sm mb-4">
                        {t('plansPage.tokenBasedUsage')}
                      </p>
                      <span className="block text-lg font-semibold text-white">{plan.price}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/planos')}
                  className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  {t('plansPage.buyNow')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <Modal
          title={t('profile.confirmDeleteTitle')}
          description={
            <div>
              <p>{t('profile.confirmDeleteText')}</p>
              <p className="mt-2 text-yellow-400">{t('profile.noRefundWarning')}</p>
            </div>
          }
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          confirmText={t('profile.confirmDeleteButton')}
          cancelText={t('profile.cancelButton')}
          size="sm"
        />
      )}
    </PageLayout>
  );
};

export default ProfilePage;
