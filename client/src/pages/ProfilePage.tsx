import React, { useEffect, useState } from 'react';
import { getUser, saveUser } from '../services/userSession';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { BASE_URL } from '../config';
import { useI18n } from '../i18n/I18nContext';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'test'>('info');
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(userData);
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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
      navigate('/');
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    }
  };

  if (loading || !user) return <div className="text-white p-4">{t('profile.loading')}</div>;

  return (
    <PageLayout title={t('profile.title')} backTo="/">
      <div className="bg-black/80 p-6 sm:p-8 rounded-2xl border border-gray-700 max-w-4xl w-full min-w-[620px] sm:min-w-[600px] shadow-lg mx-auto">
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
                onChange={handleChange}
                className="w-full bg-gray-800 px-4 py-2 rounded-md border border-gray-600"
                disabled
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-black px-6 py-3 rounded-xl font-semibold transition-all w-full"
            >
              {t('profile.saveChanges')}
            </button>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => {
                  if (user.plan === 'free') return;
                  const updatedUser = { ...user, plan: 'free' };
                  setUser(updatedUser);
                }}
                className={`cursor-pointer p-6 rounded-2xl border shadow-md transition-all ${
                  user.plan === 'free'
                    ? 'border-[#6DAEDB] bg-[#111]'
                    : 'border-gray-700 bg-[#1a1a1a] hover:border-[#6DAEDB]'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-2">{t('profile.plans.free.title')}</h3>
                <p className="text-gray-400 mb-4">{t('profile.plans.free.description')}</p>
                <span className="block text-2xl font-bold mb-4">
                  {t('profile.plans.free.price')}
                </span>
              </div>

              <div
                onClick={() => {
                  if (user.plan === 'pro') return;
                  const updatedUser = { ...user, plan: 'pro' };
                  //setUser(updatedUser);
                }}
                className={`cursor-pointer p-6 rounded-2xl border shadow-md transition-all ${
                  user.plan === 'Pro'
                    ? 'border-[#6DAEDB] bg-[#111]'
                    : 'border-gray-700 bg-[#1a1a1a] hover:border-[#6DAEDB]'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-2">{t('profile.plans.pro.title')}</h3>
                <p className="text-gray-400 mb-4">{t('profile.plans.pro.description')}</p>
                <span className="block text-2xl font-bold mb-4">
                  {t('profile.plans.pro.price')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfilePage;
